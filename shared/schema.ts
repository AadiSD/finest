import { z } from "zod";

// Event type (in-memory)
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  location?: string;
  eventDate?: string;
  guestCount?: number;
  isFeatured: boolean;
}

export const insertEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  location: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.number().optional(),
  isFeatured: z.boolean().default(false),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;

// Inquiry type (for contact form)
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  eventType: string;
  message: string;
  createdAt: Date;
}

export const insertInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  eventType: z.string().min(1, "Event type is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
