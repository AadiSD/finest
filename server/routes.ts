import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInquirySchema } from "@shared/schema";
import { Resend } from "resend";

export async function registerRoutes(app: Express): Promise<Server> {
  // Event routes (public)
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

  // Inquiry route - sends email to admin
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      
      // Send email via Resend
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

  const httpServer = createServer(app);
  return httpServer;
}
