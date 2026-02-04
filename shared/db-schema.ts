import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

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
