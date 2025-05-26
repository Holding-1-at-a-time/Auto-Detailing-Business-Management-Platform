/**
 * Script to clear seed data from the database
 * Run with: npx tsx scripts/clear-seed-data.ts
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

  console.log("🧹 Starting seed data cleanup...")
  console.log(`📍 Convex URL: ${convexUrl}`)

  // Confirm with user
  console.log("\n⚠️  WARNING: This will delete all seed data from the database!")
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...")

  await new Promise((resolve) => setTimeout(resolve, 5000))

  try {
    // Run the clear action
    const result = await client.action(api.seed.clearSeedData, {})

    if (result.success) {
      console.log("\n✅ Seed data cleared successfully!")
    } else {
      console.log("\n❌ Failed to clear seed data")
    }
  } catch (error) {
    console.error("\n❌ Error clearing seed data:", error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
