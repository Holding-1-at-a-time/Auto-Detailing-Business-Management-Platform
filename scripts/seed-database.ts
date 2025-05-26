/**
 * Script to seed the Convex database with sample data
 *
 * Usage:
 * 1. Make sure your Convex backend is running: `npx convex dev`
 * 2. Run this script: `npx tsx scripts/seed-database.ts`
 */

import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set")
  console.error("Please make sure you have a .env.local file with your Convex URL")
  process.exit(1)
}

async function seedDatabase() {
  const client = new ConvexHttpClient(CONVEX_URL)

  console.log("🌱 Starting database seed...")
  console.log(`📡 Connecting to Convex at: ${CONVEX_URL}`)

  try {
    const result = await client.action(api.seed.seedDatabase)

    console.log("✅ Database seeded successfully!")
    console.log("📊 Summary:")
    console.log(`   - Tenants: ${result.summary.tenants}`)
    console.log(`   - Users: ${result.summary.users}`)
    console.log(`   - Clients: ${result.summary.clients}`)
    console.log(`   - Bookings: ${result.summary.bookings}`)
    console.log(`   - Notifications: ${result.summary.notifications}`)

    console.log("\n🎉 You can now log in with:")
    console.log("   - owner@premiumautospa.com")
    console.log("   - admin@elitedetailworks.com")
    console.log("   - tech@premiumautospa.com")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
