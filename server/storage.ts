import {
  type Event,
  type InsertEvent,
  type Inquiry,
  type InsertInquiry,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;

  // Inquiry operations (now just for logging)
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
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

  // Inquiry operations - will be handled by email
  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const inquiry: Inquiry = {
      id: Math.random().toString(36).substring(7),
      ...inquiryData,
      createdAt: new Date(),
    };
    // Email sending will be handled in routes
    return inquiry;
  }
}

export const storage = new MemStorage();
