import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  eventType: text("event_type").notNull(),
  guests: integer("guests").notNull(),
  location: text("location").notNull(),
  decor: text("decor").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  guests: integer("guests").notNull(),
  location: text("location").notNull(),
  decor: text("decor").notNull(),
  date: text("date").notNull(),
  estimatedBudget: integer("estimated_budget").notNull(),
  finalBudget: integer("final_budget"),
  currency: text("currency").notNull().default("INR"),
  modelVersion: text("model_version").notNull().default("baseline-v1"),
  source: text("source").notNull().default("estimate"),
  bookingId: integer("booking_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
