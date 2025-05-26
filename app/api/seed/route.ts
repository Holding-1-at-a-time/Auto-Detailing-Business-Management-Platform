import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Create a Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST() {
  try {
    // Call the seed action
    const result = await convex.action(api.seedTrigger.checkAndSeedDatabase)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, message: "Failed to seed database" }, { status: 500 })
  }
}
