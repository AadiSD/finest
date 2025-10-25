import { db } from "./db";
import { events } from "@shared/schema";

const seedEvents = [
  {
    title: "Elegant Garden Wedding",
    description: "A breathtaking outdoor celebration featuring romantic garden ambiance with custom floral installations, candlelit pathways, and an exquisite reception under the stars. Every detail was meticulously crafted to create an unforgettable experience for 200 guests.",
    category: "Wedding",
    imageUrl: "/attached_assets/generated_images/Luxury_wedding_reception_venue_ad069ecc.png",
    location: "The Botanical Gardens, San Francisco",
    eventDate: "June 2024",
    guestCount: 200,
    isFeatured: true,
  },
  {
    title: "Annual Corporate Gala",
    description: "A sophisticated black-tie event showcasing innovation and excellence. Featured state-of-the-art AV production, interactive brand experiences, and world-class entertainment that impressed 500+ industry leaders and stakeholders.",
    category: "Corporate",
    imageUrl: "/attached_assets/generated_images/Corporate_gala_dinner_event_a9f58349.png",
    location: "Grand Hyatt, New York",
    eventDate: "October 2023",
    guestCount: 500,
    isFeatured: true,
  },
  {
    title: "Tropical Destination Wedding",
    description: "An intimate beachfront ceremony in paradise, complete with sunset vows, tropical florals, and a stunning reception pavilion. We coordinated every detail from travel logistics to local vendor management for this dream destination celebration.",
    category: "Destination",
    imageUrl: "/attached_assets/generated_images/Destination_wedding_ceremony_setup_b1bdc699.png",
    location: "Maui, Hawaii",
    eventDate: "March 2024",
    guestCount: 75,
    isFeatured: true,
  },
  {
    title: "Milestone Birthday Celebration",
    description: "An upscale private party celebrating a special milestone with sophisticated cocktail service, gourmet cuisine, and elegant entertainment. The intimate atmosphere featured custom décor in burgundy and gold tones creating a memorable evening.",
    category: "Private",
    imageUrl: "/attached_assets/generated_images/Upscale_private_party_celebration_37f8a0d0.png",
    location: "Private Estate, Beverly Hills",
    eventDate: "September 2023",
    guestCount: 50,
    isFeatured: true,
  },
  {
    title: "Executive Team Building Retreat",
    description: "A transformative multi-day corporate retreat combining professional development with luxury hospitality. Featured interactive workshops, networking dinners, and team activities in an inspiring mountain setting.",
    category: "Corporate",
    imageUrl: "/attached_assets/generated_images/Grand_event_venue_entrance_1ef7554f.png",
    location: "Aspen, Colorado",
    eventDate: "January 2024",
    guestCount: 100,
    isFeatured: false,
  },
  {
    title: "Intimate Vineyard Wedding",
    description: "A charming wedding celebration amid rolling vineyards, featuring farm-to-table dining, wine pairings, and rustic elegance. The ceremony took place at golden hour with reception in a beautifully restored barn.",
    category: "Wedding",
    imageUrl: "/attached_assets/generated_images/Elegant_table_setting_details_b2fd9bec.png",
    location: "Napa Valley, California",
    eventDate: "May 2024",
    guestCount: 120,
    isFeatured: false,
  },
];

async function seed() {
  try {
    console.log("Starting database seed...");
    
    // Insert seed events
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
