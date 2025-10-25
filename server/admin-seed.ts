import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Script to promote a user to admin by their email
// Usage: npx tsx server/admin-seed.ts <email>

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx server/admin-seed.ts <email>");
  console.error("Example: npx tsx server/admin-seed.ts admin@example.com");
  process.exit(1);
}

async function promoteToAdmin() {
  try {
    console.log(`Promoting user with email ${email} to admin...`);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      console.error(`User with email ${email} not found. Please log in first.`);
      process.exit(1);
    }

    await db
      .update(users)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(users.email, email));

    console.log(`✓ User ${email} promoted to admin successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    process.exit(1);
  }
}

promoteToAdmin();
