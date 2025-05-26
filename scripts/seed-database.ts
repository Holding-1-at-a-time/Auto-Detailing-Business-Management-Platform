/**
 * Script to seed the database with sample data
 * Run with: npx tsx scripts/seed-database.ts
 */

import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"

async function main() {
  // Get the Convex URL from environment variable
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is not set")
    process.exit(1)
  }

  // Create a Convex client
  const client = new ConvexHttpClient(convexUrl)

  console.log("🚀 Starting database seed process...")
  console.log(`📍 Convex URL: ${convexUrl}`)

  try {
    // Run the seed action
    const result = await client.action(api.seed.seedDatabase, {})

    if (result.success) {
      console.log("\n✅ Database seeded successfully!")
      console.log("📊 Created:")
      console.log(`   - ${result.summary.tenants} tenants`)
      console.log(`   - ${result.summary.clients} clients`)
      console.log(`   - ${result.summary.bookings} bookings`)
      console.log(`   - ${result.summary.notifications} notifications`)
    } else {
      console.log("\n⚠️  Seeding skipped:", result.message)
    }
  } catch (error) {
    console.error("\n❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
