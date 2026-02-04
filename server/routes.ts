import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema, insertBookingSchema } from "@shared/schema";
import { Resend } from "resend";
import OpenAI from "openai";

const adminUser = process.env.ADMIN_USERNAME || "ADadmin";
const adminPass = process.env.ADMIN_PASSWORD || "123Admin";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function isAdmin(req: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString("utf8");
  const [user, pass] = decoded.split(":");
  return user === adminUser && pass === adminPass;
}

export async function registerRoutes(app: Express): Promise<Server> {
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
    const { username, password } = req.body || {};
    if (username === adminUser && password === adminPass) {
      return res.json({ ok: true });
    }
    return res.status(401).json({ message: "Invalid admin credentials" });
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
      res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.post("/api/bookings/:id/accepted", async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
    const booking = await storage.updateBookingStatus(req.params.id, "accepted");
    if (!booking) return res.status(404).json({ message: "Not found" });
    res.json(booking);
  });

  app.post("/api/bookings/:id/rejected", async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
    const booking = await storage.updateBookingStatus(req.params.id, "rejected");
    if (!booking) return res.status(404).json({ message: "Not found" });
    res.json(booking);
  });

  app.post("/api/chat", async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OPENAI_API_KEY not configured" });
    }

    try {
      const { messages = [] } = req.body || {};
      const transcript = Array.isArray(messages)
        ? messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")
        : "";

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: `You are the Blessed Hospitality assistant. Be concise and helpful.\n\n${transcript}`,
        max_output_tokens: 300,
      });

      const reply = response.output_text || "Sorry, I couldn't generate a reply.";
      res.json({ reply });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
