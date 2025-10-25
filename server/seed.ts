import { db } from "./db";
import { events } from "@shared/schema";

const seedEvents = [
  {
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
    title: "Luxury Wedding Reception",
    description: "An opulent wedding reception at a premium banquet hall featuring grand chandeliers, exquisite floral arrangements, and world-class catering services.",
    category: "wedding",
    imageUrl: "/attached_assets/stock_images/luxury_indian_weddin_6c287dfd.jpg",
    location: "Hyderabad, Telangana",
    eventDate: "January 2024",
    guestCount: 700,
    isFeatured: false,
  },
  {
    title: "Mehendi & Haldi Function",
    description: "A vibrant pre-wedding celebration with traditional mehendi artists, haldi ceremony, and colorful decor creating unforgettable memories.",
    category: "private",
    imageUrl: "/attached_assets/stock_images/indian_party_celebra_c1fa1c78.jpg",
    location: "Pune, Maharashtra",
    eventDate: "February 2024",
    guestCount: 250,
    isFeatured: false,
  },
  {
    title: "Diwali Corporate Gala",
    description: "A spectacular Diwali celebration for corporate clients featuring traditional diyas, rangoli, cultural performances, and festive dinner.",
    category: "corporate",
    imageUrl: "/attached_assets/stock_images/indian_festival_cele_f3e1876a.jpg",
    location: "Gurugram, Haryana",
    eventDate: "November 2023",
    guestCount: 350,
    isFeatured: false,
  },
  {
    title: "Destination Wedding Udaipur",
    description: "A regal destination wedding at a palace venue overlooking Lake Pichola, combining royal heritage with modern luxury and traditional ceremonies.",
    category: "destination",
    imageUrl: "/attached_assets/stock_images/indian_destination_w_2ad3396c.jpg",
    location: "Udaipur, Rajasthan",
    eventDate: "December 2023",
    guestCount: 400,
    isFeatured: false,
  },
  {
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
    title: "Annual Corporate Conference",
    description: "A professional corporate conference with keynote speakers, panel discussions, and networking sessions in a sophisticated venue setting.",
    category: "corporate",
    imageUrl: "/attached_assets/stock_images/indian_corporate_eve_e692aecb.jpg",
    location: "Bangalore, Karnataka",
    eventDate: "April 2024",
    guestCount: 300,
    isFeatured: false,
  },
];

async function seed() {
  try {
    console.log("Starting database seed...");
    
    for (const event of seedEvents) {
      await db.insert(events).values(event);
      console.log(`✓ Created event: ${event.title}`);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
