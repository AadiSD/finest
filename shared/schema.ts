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

// Booking type
export interface BookingRequest {
  id: string;
  name: string;
  email: string;
  eventType: string;
  guests: number;
  location: string;
  decor: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
  estimateId?: string | null;
  estimatedBudget?: number | null;
  finalBudget?: number | null;
  currency?: string | null;
  modelVersion?: string | null;
  createdAt: Date;
}

export const insertBookingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  eventType: z.string().min(1),
  guests: z.coerce.number().min(1),
  location: z.string().min(1),
  decor: z.string().min(1),
  date: z.string().min(1),
  estimateId: z.string().optional(),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Estimate type
export interface Estimate {
  id: string;
  eventType: string;
  guests: number;
  location: string;
  decor: string;
  date: string;
  estimatedBudget: number;
  finalBudget?: number | null;
  currency: string;
  modelVersion: string;
  source: "estimate" | "booking";
  bookingId?: string | null;
  createdAt: Date;
}

export interface EstimatePrediction {
  id?: string;
  estimatedBudget: number;
  budgetLow: number;
  budgetHigh: number;
  currency: string;
  modelVersion: string;
  confidenceLabel: "low" | "medium" | "high";
  confidenceScore: number;
}

export interface AdminAccount {
  id: string;
  username: string;
  role: "super_admin" | "admin";
  isDefault: boolean;
  createdAt: Date;
}

export const insertAdminSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can use letters, numbers, ., _, and -"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export const estimateRequestSchema = z.object({
  eventType: z.string().min(1),
  guests: z.coerce.number().min(1),
  location: z.string().min(1),
  decor: z.string().min(1),
  date: z.string().min(1),
});

export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
