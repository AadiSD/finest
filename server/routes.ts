import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema, insertBookingSchema, estimateRequestSchema, insertAdminSchema, type AdminAccount } from "@shared/schema";
import { Resend } from "resend";
import { estimateBudget, getEstimatorMetadata } from "./ml/estimator";

const adminUser = process.env.ADMIN_USERNAME || "ADadmin";
const adminPass = process.env.ADMIN_PASSWORD || "123Admin";
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
if (!geminiApiKey) {
  console.warn("[startup] GEMINI_API_KEY is not set. Chatbot will fail until configured.");
}

async function getAuthenticatedAdmin(req: any): Promise<AdminAccount | undefined> {
  const adminId = req.session?.adminId;
  if (!adminId) return undefined;

  const admin = await storage.getAdminById(adminId);
  if (!admin) {
    req.session.adminId = undefined;
    req.session.adminRole = undefined;
    req.session.adminUsername = undefined;
    return undefined;
  }

  req.session.adminRole = admin.role;
  req.session.adminUsername = admin.username;
  return admin;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await storage.upsertDefaultSuperAdmin(adminUser, adminPass);

  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (_req, res) => {
    try {
      const events = await storage.getFeaturedEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);

      if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const escapeHtml = (text: string) => {
          return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.ADMIN_EMAIL,
            subject: `New Inquiry from ${validatedData.name} - ${validatedData.eventType}`,
            html: `
              <h2>New Contact Inquiry</h2>
              <p><strong>From:</strong> ${escapeHtml(validatedData.name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
              <p><strong>Event Type:</strong> ${escapeHtml(validatedData.eventType)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(validatedData.message).replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Received: ${new Date().toISOString()}</small></p>
            `,
          });
          console.log("Email sent successfully to", process.env.ADMIN_EMAIL);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      } else {
        console.log("=== New Contact Inquiry (Email not configured) ===");
        console.log("From:", validatedData.name, `(${validatedData.email})`);
        console.log("Event Type:", validatedData.eventType);
        console.log("Message:", validatedData.message);
        console.log("========================");
      }

      res.status(201).json(inquiry);
    } catch (error: any) {
      console.error("Error creating inquiry:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send inquiry" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const run = async () => {
      const { username, password } = req.body || {};
      const admin = await storage.authenticateAdmin(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      req.session.regenerate((error) => {
        if (error) {
          console.error("Admin login session error:", error);
          return res.status(500).json({ message: "Failed to start admin session" });
        }

        req.session.adminId = admin.id;
        req.session.adminRole = admin.role;
        req.session.adminUsername = admin.username;
        return res.json({ ok: true, username: admin.username, role: admin.role });
      });
    };

    run().catch((error) => {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Failed to start admin session" });
    });
  });

  app.get("/api/admin/session", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      authenticated: true,
      username: admin.username,
      role: admin.role,
    });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error("Admin logout session error:", error);
        return res.status(500).json({ message: "Failed to end admin session" });
      }

      res.clearCookie("fh_admin_session");
      return res.json({ ok: true });
    });
  });

  app.get("/api/admins", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (admin.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });

    const admins = await storage.getAdmins();
    res.json(admins);
  });

  app.post("/api/admins", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (admin.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });

    try {
      const payload = insertAdminSchema.parse(req.body);
      const createdAdmin = await storage.createAdmin(payload);
      res.status(201).json(createdAdmin);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid admin data", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Admin username already exists") {
        return res.status(409).json({ message: error.message });
      }
      console.error("Create admin error:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  app.delete("/api/admins/:id", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (admin.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });

    const targetAdmin = await storage.getAdminById(req.params.id);
    if (!targetAdmin) return res.status(404).json({ message: "Admin not found" });
    if (targetAdmin.isDefault || targetAdmin.role === "super_admin") {
      return res.status(400).json({ message: "Default super admin cannot be deleted" });
    }
    if (targetAdmin.id === admin.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const deleted = await storage.deleteAdmin(targetAdmin.id);
    if (!deleted) return res.status(404).json({ message: "Admin not found" });
    res.json({ ok: true });
  });

  app.get("/api/bookings/blocked-dates", async (_req, res) => {
    const blocked = await storage.getBlockedDates();
    res.json(blocked);
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validated = insertBookingSchema.parse(req.body);
      const blocked = await storage.getBlockedDates();
      if (blocked.includes(validated.date)) {
        return res.status(409).json({ message: "Date already booked" });
      }
      const booking = await storage.createBooking(validated);
      const estimateId = validated.estimateId;
      if (estimateId) {
        await storage.updateEstimateBooking(estimateId, booking.id);
      } else {
        const estimated = estimateBudget({
          eventType: booking.eventType,
          guests: booking.guests,
          location: booking.location,
          decor: booking.decor,
          date: booking.date,
        });
        await storage.createEstimate({
          eventType: booking.eventType,
          guests: booking.guests,
          location: booking.location,
          decor: booking.decor,
          date: booking.date,
          estimatedBudget: estimated.estimatedBudget,
          currency: estimated.currency,
          modelVersion: estimated.modelVersion,
          source: "booking",
          bookingId: booking.id,
        });
      }
      res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.post("/api/bookings/:id/accepted", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    const booking = await storage.updateBookingStatus(req.params.id, "accepted");
    if (!booking) return res.status(404).json({ message: "Not found" });
    res.json(booking);
  });

  app.post("/api/bookings/:id/rejected", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    const booking = await storage.updateBookingStatus(req.params.id, "rejected");
    if (!booking) return res.status(404).json({ message: "Not found" });
    res.json(booking);
  });

  app.post("/api/bookings/:id/final-budget", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    const finalBudget = Number.parseInt(String(req.body?.finalBudget ?? ""), 10);
    if (Number.isNaN(finalBudget) || finalBudget <= 0) {
      return res.status(400).json({ message: "Invalid final budget" });
    }
    const estimate = await storage.updateEstimateFinalBudget(req.params.id, finalBudget);
    if (!estimate) return res.status(404).json({ message: "Estimate not found" });
    res.json(estimate);
  });

  app.post("/api/estimate", async (req, res) => {
    try {
      const input = estimateRequestSchema.parse(req.body);
      const estimated = estimateBudget(input);
      const estimate = await storage.createEstimate({
        ...input,
        estimatedBudget: estimated.estimatedBudget,
        currency: estimated.currency,
        modelVersion: estimated.modelVersion,
        source: "estimate",
      });
      res.status(201).json({
        id: estimate.id,
        estimatedBudget: estimate.estimatedBudget,
        budgetLow: estimated.budgetLow,
        budgetHigh: estimated.budgetHigh,
        currency: estimate.currency,
        modelVersion: estimate.modelVersion,
        confidenceLabel: estimated.confidenceLabel,
        confidenceScore: estimated.confidenceScore,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid estimate request", errors: error.errors });
      }
      console.error("Estimate error:", error);
      res.status(500).json({ message: "Failed to create estimate" });
    }
  });

  app.get("/api/estimates/export", async (req, res) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    try {
      const estimates = await storage.getEstimates();
      const header = [
        "id",
        "eventType",
        "guests",
        "location",
        "decor",
        "date",
        "estimated_budget",
        "final_budget",
        "currency",
        "model_version",
        "source",
        "booking_id",
        "created_at",
      ];

      const escapeCell = (value: unknown) => {
        if (value == null) return "";
        const text = String(value);
        if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
          return `"${text.replace(/\"/g, "\"\"")}"`;
        }
        return text;
      };

      const rows = estimates.map((e) => [
        e.id,
        e.eventType,
        e.guests,
        e.location,
        e.decor,
        e.date,
        e.estimatedBudget,
        e.finalBudget ?? "",
        e.currency,
        e.modelVersion,
        e.source,
        e.bookingId ?? "",
        e.createdAt.toISOString(),
      ]);

      const csv = [header.join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=estimates.csv");
      res.send(csv);
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export estimates" });
    }
  });

  app.get("/api/estimate/model-info", (_req, res) => {
    res.json(getEstimatorMetadata());
  });

  app.post("/api/chat", async (req, res) => {
    if (!geminiApiKey) {
      return res.status(500).json({ message: "GEMINI_API_KEY not configured" });
    }

    try {
      const events = await storage.getAllEvents();
      const eventSummaries = events
        .map((e) => `- ${e.title} (${e.category})${e.location ? `, ${e.location}` : ""}${e.eventDate ? `, ${e.eventDate}` : ""}`)
        .join("\n");

      const { messages = [] } = req.body || {};
      const transcript = Array.isArray(messages)
        ? messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")
        : "";

      const blockedDates = await storage.getBlockedDates();
      const blockedList = blockedDates.length ? blockedDates.join(", ") : "None";

      const prompt = `You are the Blessed Hospitality assistant for an event management portfolio site.
Use only the company details below. If a user asks something not covered, say you can help connect them with the team.
Respond in 2-4 short sentences. No markdown, no bullet symbols, no emojis.

Company offerings:
Services: Indian Weddings, Corporate Events, Sangeet & Mehendi, Destination Weddings
Locations: Mumbai, Pune, Delhi
Packages (guests): Up to 100, Up to 500, Up to 1000
Decoration types: Simple, Intermediate, Premium
Unavailable dates (already booked): ${blockedList}

Portfolio events:
${eventSummaries}

Conversation:
${transcript}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
      const geminiRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!geminiRes.ok) {
        const text = await geminiRes.text();
        console.error("Chat error:", text);
        return res.status(500).json({ message: "Chat failed" });
      }

      const data = await geminiRes.json();
      const rawReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a reply.";
      const reply = rawReply
        .replace(/^\s*[-*•]\s+/gm, "")
        .replace(/[`*_>#]/g, "")
        .trim();
      res.json({ reply });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
