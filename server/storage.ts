import {
  type Event,
  type InsertEvent,
  type Inquiry,
  type InsertInquiry,
  type AdminAccount,
  type InsertAdmin,
  type BookingRequest,
  type InsertBooking,
  type Estimate,
  type EstimateRequest,
} from "@shared/schema";
import { db } from "./db";
import { bookings as bookingsTable, estimates as estimatesTable, admins as adminsTable } from "@shared/db-schema";
import { desc, eq, inArray } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./admin-auth";

type StoredAdmin = AdminAccount & {
  passwordHash: string;
};

// Interface for storage operations
export interface IStorage {
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;

  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;

  // Booking operations
  getBookings(): Promise<BookingRequest[]>;
  createBooking(request: InsertBooking): Promise<BookingRequest>;
  updateBookingStatus(id: string, status: "accepted" | "rejected"): Promise<BookingRequest | undefined>;
  getBlockedDates(): Promise<string[]>;

  // Estimate operations
  getEstimates(): Promise<Estimate[]>;
  createEstimate(request: EstimateRequest & { estimatedBudget: number; currency: string; modelVersion: string; source: "estimate" | "booking"; bookingId?: string | null }): Promise<Estimate>;
  updateEstimateBooking(id: string, bookingId: string): Promise<Estimate | undefined>;
  updateEstimateFinalBudget(bookingId: string, finalBudget: number): Promise<Estimate | undefined>;

  // Admin operations
  upsertDefaultSuperAdmin(username: string, password: string): Promise<AdminAccount>;
  authenticateAdmin(username: string, password: string): Promise<AdminAccount | undefined>;
  getAdmins(): Promise<AdminAccount[]>;
  getAdminById(id: string): Promise<AdminAccount | undefined>;
  createAdmin(admin: InsertAdmin): Promise<AdminAccount>;
  deleteAdmin(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private events: Event[] = [
    {
      id: "1",
      title: "Royal Rajasthani Wedding",
      description: "A magnificent traditional Rajasthani wedding celebration with vibrant colors, royal decorations, and authentic cultural performances. Experience the grandeur of Rajput traditions in the Pink City.",
      category: "wedding",
      imageUrl: "/attached_assets/stock_images/indian_rajasthani_we_7b398419.jpg",
      location: "Jaipur, Rajasthan",
      eventDate: "February 2024",
      guestCount: 800,
      isFeatured: true,
    },
    {
      id: "2",
      title: "Tech Innovation Summit",
      description: "A prestigious corporate event bringing together industry leaders, innovators, and tech enthusiasts. State-of-the-art venue with world-class hospitality and networking opportunities.",
      category: "corporate",
      imageUrl: "/attached_assets/stock_images/mumbai_corporate_eve_851a13ca.jpg",
      location: "Mumbai, Maharashtra",
      eventDate: "March 2024",
      guestCount: 500,
      isFeatured: true,
    },
    {
      id: "3",
      title: "Sunset Beach Wedding",
      description: "A dreamy destination wedding by the Arabian Sea featuring stunning sunset views, beachside mandap, and tropical elegance combined with traditional Indian rituals.",
      category: "destination",
      imageUrl: "/attached_assets/stock_images/goa_beach_wedding_de_8c4c5f5b.jpg",
      location: "Goa",
      eventDate: "January 2024",
      guestCount: 300,
      isFeatured: true,
    },
    {
      id: "4",
      title: "Grand Sangeet Night",
      description: "An electrifying sangeet celebration with live music, dance performances, and vibrant decorations. A perfect blend of traditional and contemporary entertainment.",
      category: "wedding",
      imageUrl: "/attached_assets/stock_images/indian_sangeet_night_4011fe32.jpg",
      location: "Delhi NCR",
      eventDate: "December 2023",
      guestCount: 600,
      isFeatured: true,
    },
    {
      id: "5",
      title: "Holi Festival Celebration",
      description: "A colorful corporate Holi bash celebrating the festival of colors with traditional music, authentic cuisine, and vibrant festivities bringing teams together.",
      category: "corporate",
      imageUrl: "/attached_assets/stock_images/indian_holi_festival_9dd572d9.jpg",
      location: "Bangalore, Karnataka",
      eventDate: "March 2024",
      guestCount: 400,
      isFeatured: true,
    },
    {
      id: "6",
      title: "Traditional Kerala Wedding",
      description: "An authentic Kerala wedding ceremony showcasing South Indian traditions, temple architecture-inspired decor, and classical cultural elements.",
      category: "wedding",
      imageUrl: "/attached_assets/stock_images/kerala_traditional_i_deef526d.jpg",
      location: "Kochi, Kerala",
      eventDate: "November 2023",
      guestCount: 450,
      isFeatured: true,
    },
    {
      id: "7",
      title: "Luxury Wedding Reception",
      description: "An opulent wedding reception at a premium banquet hall featuring grand chandeliers, exquisite floral arrangements, and world-class catering services.",
      category: "wedding",
      imageUrl: "/attached_assets/generated_images/Luxury_wedding_reception_venue_ad069ecc.png",
      location: "Hyderabad, Telangana",
      eventDate: "January 2024",
      guestCount: 700,
      isFeatured: false,
    },
    {
      id: "8",
      title: "Mehendi & Haldi Function",
      description: "A vibrant pre-wedding celebration with traditional mehendi artists, haldi ceremony, and colorful decor creating unforgettable memories.",
      category: "private",
      imageUrl: "/attached_assets/generated_images/Upscale_private_party_celebration_37f8a0d0.png",
      location: "Pune, Maharashtra",
      eventDate: "February 2024",
      guestCount: 250,
      isFeatured: false,
    },
    {
      id: "9",
      title: "Diwali Corporate Gala",
      description: "A spectacular Diwali celebration for corporate clients featuring traditional diyas, rangoli, cultural performances, and festive dinner.",
      category: "corporate",
      imageUrl: "/attached_assets/generated_images/Corporate_gala_dinner_event_a9f58349.png",
      location: "Gurugram, Haryana",
      eventDate: "November 2023",
      guestCount: 350,
      isFeatured: false,
    },
    {
      id: "10",
      title: "Destination Wedding Udaipur",
      description: "A regal destination wedding at a palace venue overlooking Lake Pichola, combining royal heritage with modern luxury and traditional ceremonies.",
      category: "destination",
      imageUrl: "/attached_assets/generated_images/Destination_wedding_ceremony_setup_b1bdc699.png",
      location: "Udaipur, Rajasthan",
      eventDate: "December 2023",
      guestCount: 400,
      isFeatured: false,
    },
    {
      id: "11",
      title: "Grand Wedding Ceremony",
      description: "A traditional Indian wedding ceremony with elaborate mandap decorations, Vedic rituals, and celebration of sacred union in authentic style.",
      category: "wedding",
      imageUrl: "/attached_assets/stock_images/indian_wedding_cerem_96f31f4b.jpg",
      location: "Lucknow, Uttar Pradesh",
      eventDate: "January 2024",
      guestCount: 650,
      isFeatured: false,
    },
    {
      id: "12",
      title: "Annual Corporate Conference",
      description: "A professional corporate conference with keynote speakers, panel discussions, and networking sessions in a sophisticated venue setting.",
      category: "corporate",
      imageUrl: "/attached_assets/stock_images/indian_corporate_eve_e692aecb.jpg",
      location: "Bangalore, Karnataka",
      eventDate: "April 2024",
      guestCount: 300,
      isFeatured: false,
    },
    {
      id: "13",
      title: "Elegant Private Dinner",
      description: "An intimate and sophisticated private dinner party with exquisite table settings, premium decor, and personalized service for an exclusive gathering.",
      category: "private",
      imageUrl: "/attached_assets/generated_images/Elegant_table_setting_details_b2fd9bec.png",
      location: "Chennai, Tamil Nadu",
      eventDate: "May 2024",
      guestCount: 50,
      isFeatured: false,
    },
    {
      id: "14",
      title: "Grand Anniversary Celebration",
      description: "A spectacular anniversary celebration at an elegant venue featuring stunning entrance decor, grand ambiance, and memorable moments for the couple and guests.",
      category: "private",
      imageUrl: "/attached_assets/generated_images/Grand_event_venue_entrance_1ef7554f.png",
      location: "Kolkata, West Bengal",
      eventDate: "March 2024",
      guestCount: 200,
      isFeatured: false,
    },
  ];

  private bookings: BookingRequest[] = [];
  private estimates: Estimate[] = [];
  private admins: StoredAdmin[] = [];
  private dbUnavailableLogged = false;

  private logDbFallback(error: unknown) {
    if (this.dbUnavailableLogged) return;
    this.dbUnavailableLogged = true;
    console.warn("[storage] Database unavailable, falling back to in-memory storage.");
    if (error instanceof Error) {
      console.warn("[storage] DB error:", error.message);
    }
  }

  private toAdminAccount(admin: StoredAdmin): AdminAccount {
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      isDefault: admin.isDefault,
      createdAt: admin.createdAt,
    };
  }

  // Event operations
  async getAllEvents(): Promise<Event[]> {
    return this.events;
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return this.events.filter(event => event.isFeatured);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.find(event => event.id === id);
  }

  // Inquiry operations
  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const inquiry: Inquiry = {
      id: Math.random().toString(36).substring(7),
      ...inquiryData,
      createdAt: new Date(),
    };
    return inquiry;
  }

  // Booking operations
  async getBookings(): Promise<BookingRequest[]> {
    if (db) {
      try {
        const rows = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
        const bookingIds = rows.map((row) => row.id);
        const estimatesByBookingId = new Map<number, typeof estimatesTable.$inferSelect>();
        if (bookingIds.length) {
          const estimateRows = await db
            .select()
            .from(estimatesTable)
            .where(inArray(estimatesTable.bookingId, bookingIds));
          estimateRows.forEach((row) => {
            if (row.bookingId != null) {
              estimatesByBookingId.set(row.bookingId, row);
            }
          });
        }
        return rows.map((row) => ({
          id: row.id.toString(),
          name: row.name,
          email: row.email,
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          status: row.status as BookingRequest["status"],
          estimateId: estimatesByBookingId.get(row.id)?.id?.toString() ?? null,
          estimatedBudget: estimatesByBookingId.get(row.id)?.estimatedBudget ?? null,
          finalBudget: estimatesByBookingId.get(row.id)?.finalBudget ?? null,
          currency: estimatesByBookingId.get(row.id)?.currency ?? null,
          modelVersion: estimatesByBookingId.get(row.id)?.modelVersion ?? null,
          createdAt: row.createdAt,
        }));
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    return this.bookings.map((booking) => {
      const estimate = this.estimates.find((e) => e.bookingId === booking.id);
      return {
        ...booking,
        estimateId: estimate?.id ?? null,
        estimatedBudget: estimate?.estimatedBudget ?? null,
        finalBudget: estimate?.finalBudget ?? null,
        currency: estimate?.currency ?? null,
        modelVersion: estimate?.modelVersion ?? null,
      };
    });
  }

  async createBooking(data: InsertBooking): Promise<BookingRequest> {
    if (db) {
      try {
        const [row] = await db
          .insert(bookingsTable)
          .values({
            name: data.name,
            email: data.email,
            eventType: data.eventType,
            guests: data.guests,
            location: data.location,
            decor: data.decor,
            date: data.date,
            status: "pending",
          })
          .returning();
        return {
          id: row.id.toString(),
          name: row.name,
          email: row.email,
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          status: row.status as BookingRequest["status"],
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    const booking: BookingRequest = {
      id: Math.random().toString(36).substring(7),
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.unshift(booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: "accepted" | "rejected"): Promise<BookingRequest | undefined> {
    if (db) {
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId)) return undefined;
      try {
        const [row] = await db
          .update(bookingsTable)
          .set({ status })
          .where(eq(bookingsTable.id, numericId))
          .returning();
        if (!row) return undefined;
        return {
          id: row.id.toString(),
          name: row.name,
          email: row.email,
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          status: row.status as BookingRequest["status"],
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return undefined;
    booking.status = status;
    return booking;
  }

  async getBlockedDates(): Promise<string[]> {
    if (db) {
      try {
        const rows = await db
          .select({ date: bookingsTable.date })
          .from(bookingsTable)
          .where(eq(bookingsTable.status, "accepted"));
        return rows.map((row) => row.date);
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    return this.bookings.filter((b) => b.status === "accepted").map((b) => b.date);
  }

  async createEstimate(data: EstimateRequest & { estimatedBudget: number; currency: string; modelVersion: string; source: "estimate" | "booking"; bookingId?: string | null }): Promise<Estimate> {
    if (db) {
      try {
        const [row] = await db
          .insert(estimatesTable)
          .values({
            eventType: data.eventType,
            guests: data.guests,
            location: data.location,
            decor: data.decor,
            date: data.date,
            estimatedBudget: data.estimatedBudget,
            currency: data.currency,
            modelVersion: data.modelVersion,
            source: data.source,
            bookingId: data.bookingId ? Number.parseInt(data.bookingId, 10) : null,
          })
          .returning();
        return {
          id: row.id.toString(),
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          estimatedBudget: row.estimatedBudget,
          finalBudget: row.finalBudget ?? null,
          currency: row.currency,
          modelVersion: row.modelVersion,
          source: row.source as Estimate["source"],
          bookingId: row.bookingId ? row.bookingId.toString() : null,
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    const estimate: Estimate = {
      id: Math.random().toString(36).substring(7),
      eventType: data.eventType,
      guests: data.guests,
      location: data.location,
      decor: data.decor,
      date: data.date,
      estimatedBudget: data.estimatedBudget,
      finalBudget: null,
      currency: data.currency,
      modelVersion: data.modelVersion,
      source: data.source,
      bookingId: data.bookingId ?? null,
      createdAt: new Date(),
    };
    this.estimates.unshift(estimate);
    return estimate;
  }

  async getEstimates(): Promise<Estimate[]> {
    if (db) {
      try {
        const rows = await db.select().from(estimatesTable).orderBy(desc(estimatesTable.createdAt));
        return rows.map((row) => ({
          id: row.id.toString(),
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          estimatedBudget: row.estimatedBudget,
          finalBudget: row.finalBudget ?? null,
          currency: row.currency,
          modelVersion: row.modelVersion,
          source: row.source as Estimate["source"],
          bookingId: row.bookingId ? row.bookingId.toString() : null,
          createdAt: row.createdAt,
        }));
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    return [...this.estimates];
  }

  async updateEstimateBooking(id: string, bookingId: string): Promise<Estimate | undefined> {
    if (db) {
      const numericId = Number.parseInt(id, 10);
      const numericBookingId = Number.parseInt(bookingId, 10);
      if (Number.isNaN(numericId) || Number.isNaN(numericBookingId)) return undefined;
      try {
        const [row] = await db
          .update(estimatesTable)
          .set({ bookingId: numericBookingId })
          .where(eq(estimatesTable.id, numericId))
          .returning();
        if (!row) return undefined;
        return {
          id: row.id.toString(),
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          estimatedBudget: row.estimatedBudget,
          finalBudget: row.finalBudget ?? null,
          currency: row.currency,
          modelVersion: row.modelVersion,
          source: row.source as Estimate["source"],
          bookingId: row.bookingId ? row.bookingId.toString() : null,
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    const estimate = this.estimates.find((e) => e.id === id);
    if (!estimate) return undefined;
    estimate.bookingId = bookingId;
    return estimate;
  }

  async updateEstimateFinalBudget(bookingId: string, finalBudget: number): Promise<Estimate | undefined> {
    if (db) {
      const numericBookingId = Number.parseInt(bookingId, 10);
      if (Number.isNaN(numericBookingId)) return undefined;
      try {
        const [row] = await db
          .update(estimatesTable)
          .set({ finalBudget })
          .where(eq(estimatesTable.bookingId, numericBookingId))
          .returning();
        if (!row) return undefined;
        return {
          id: row.id.toString(),
          eventType: row.eventType,
          guests: row.guests,
          location: row.location,
          decor: row.decor,
          date: row.date,
          estimatedBudget: row.estimatedBudget,
          finalBudget: row.finalBudget ?? null,
          currency: row.currency,
          modelVersion: row.modelVersion,
          source: row.source as Estimate["source"],
          bookingId: row.bookingId ? row.bookingId.toString() : null,
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }
    const estimate = this.estimates.find((e) => e.bookingId === bookingId);
    if (!estimate) return undefined;
    estimate.finalBudget = finalBudget;
    return estimate;
  }

  async upsertDefaultSuperAdmin(username: string, password: string): Promise<AdminAccount> {
    if (db) {
      try {
        const existingDefault = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.isDefault, true))
          .limit(1);

        if (existingDefault[0]) {
          const current = existingDefault[0];
          const nextHash = verifyPassword(password, current.passwordHash)
            ? current.passwordHash
            : hashPassword(password);

          const [row] = await db
            .update(adminsTable)
            .set({
              username,
              passwordHash: nextHash,
              role: "super_admin",
              isDefault: true,
            })
            .where(eq(adminsTable.id, current.id))
            .returning();

          return this.toAdminAccount({
            id: row.id.toString(),
            username: row.username,
            passwordHash: row.passwordHash,
            role: row.role as AdminAccount["role"],
            isDefault: row.isDefault,
            createdAt: row.createdAt,
          });
        }

        const [row] = await db
          .insert(adminsTable)
          .values({
            username,
            passwordHash: hashPassword(password),
            role: "super_admin",
            isDefault: true,
          })
          .returning();

        return this.toAdminAccount({
          id: row.id.toString(),
          username: row.username,
          passwordHash: row.passwordHash,
          role: row.role as AdminAccount["role"],
          isDefault: row.isDefault,
          createdAt: row.createdAt,
        });
      } catch (error) {
        this.logDbFallback(error);
      }
    }

    const existingDefault = this.admins.find((admin) => admin.isDefault);
    if (existingDefault) {
      existingDefault.username = username;
      existingDefault.passwordHash = verifyPassword(password, existingDefault.passwordHash)
        ? existingDefault.passwordHash
        : hashPassword(password);
      existingDefault.role = "super_admin";
      return this.toAdminAccount(existingDefault);
    }

    const admin: StoredAdmin = {
      id: Math.random().toString(36).substring(7),
      username,
      passwordHash: hashPassword(password),
      role: "super_admin",
      isDefault: true,
      createdAt: new Date(),
    };
    this.admins.unshift(admin);
    return this.toAdminAccount(admin);
  }

  async authenticateAdmin(username: string, password: string): Promise<AdminAccount | undefined> {
    if (db) {
      try {
        const rows = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.username, username))
          .limit(1);
        const row = rows[0];
        if (!row) return undefined;
        if (!verifyPassword(password, row.passwordHash)) return undefined;

        return {
          id: row.id.toString(),
          username: row.username,
          role: row.role as AdminAccount["role"],
          isDefault: row.isDefault,
          createdAt: row.createdAt,
        };
      } catch (error) {
        this.logDbFallback(error);
      }
    }

    const admin = this.admins.find((item) => item.username === username);
    if (!admin || !verifyPassword(password, admin.passwordHash)) return undefined;
    return this.toAdminAccount(admin);
  }

  async getAdmins(): Promise<AdminAccount[]> {
    if (db) {
      try {
        const rows = await db.select().from(adminsTable).orderBy(desc(adminsTable.createdAt));
        return rows.map((row) => ({
          id: row.id.toString(),
          username: row.username,
          role: row.role as AdminAccount["role"],
          isDefault: row.isDefault,
          createdAt: row.createdAt,
        }));
      } catch (error) {
        this.logDbFallback(error);
      }
    }

    return this.admins.map((admin) => this.toAdminAccount(admin));
  }

  async getAdminById(id: string): Promise<AdminAccount | undefined> {
    if (db) {
      const numericId = Number.parseInt(id, 10);
      if (!Number.isNaN(numericId)) {
        try {
          const rows = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.id, numericId))
            .limit(1);
          const row = rows[0];
          if (!row) return undefined;
          return {
            id: row.id.toString(),
            username: row.username,
            role: row.role as AdminAccount["role"],
            isDefault: row.isDefault,
            createdAt: row.createdAt,
          };
        } catch (error) {
          this.logDbFallback(error);
        }
      }
    }

    const admin = this.admins.find((item) => item.id === id);
    return admin ? this.toAdminAccount(admin) : undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<AdminAccount> {
    if (db) {
      try {
        const existing = await db
          .select()
          .from(adminsTable)
          .where(eq(adminsTable.username, admin.username))
          .limit(1);
        if (existing[0]) {
          throw new Error("Admin username already exists");
        }

        const [row] = await db
          .insert(adminsTable)
          .values({
            username: admin.username,
            passwordHash: hashPassword(admin.password),
            role: "admin",
            isDefault: false,
          })
          .returning();

        return {
          id: row.id.toString(),
          username: row.username,
          role: row.role as AdminAccount["role"],
          isDefault: row.isDefault,
          createdAt: row.createdAt,
        };
      } catch (error) {
        if (error instanceof Error && error.message === "Admin username already exists") {
          throw error;
        }
        this.logDbFallback(error);
      }
    }

    if (this.admins.some((item) => item.username === admin.username)) {
      throw new Error("Admin username already exists");
    }

    const nextAdmin: StoredAdmin = {
      id: Math.random().toString(36).substring(7),
      username: admin.username,
      passwordHash: hashPassword(admin.password),
      role: "admin",
      isDefault: false,
      createdAt: new Date(),
    };
    this.admins.unshift(nextAdmin);
    return this.toAdminAccount(nextAdmin);
  }

  async deleteAdmin(id: string): Promise<boolean> {
    if (db) {
      const numericId = Number.parseInt(id, 10);
      if (!Number.isNaN(numericId)) {
        try {
          const deleted = await db
            .delete(adminsTable)
            .where(eq(adminsTable.id, numericId))
            .returning({ id: adminsTable.id });
          return deleted.length > 0;
        } catch (error) {
          this.logDbFallback(error);
        }
      }
    }

    const before = this.admins.length;
    this.admins = this.admins.filter((admin) => admin.id !== id);
    return this.admins.length < before;
  }
}

export const storage = new MemStorage();
