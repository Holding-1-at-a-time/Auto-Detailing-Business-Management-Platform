import { type NextRequest, NextResponse } from "next/server"
import { convex } from "@/lib/convex/convex-client"
import { getTenantFromHost } from "@/lib/tenant"

export async function POST(request: NextRequest) {
  try {
    // Extract tenant from request
    const tenantId = getTenantFromHost(request)
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { message, threadId, userId } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    let response
    if (!threadId) {
      // Create a new thread
      response = await convex.mutation("agent.createThread", {
        tenantId,
        title: "Booking Conversation",
      })

      // Start the booking workflow
      await convex.mutation("bookingWorkflow.startBookingWorkflow", {
        tenantId,
        threadId: response.threadId,
        userId: userId || "anonymous",
        prompt: message,
      })
    } else {
      // Continue existing thread
      response = await convex.mutation("agent.continueThread", {
        tenantId,
        threadId,
        prompt: message,
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in booking agent API:", error)
    return NextResponse.json({ error: "Failed to process booking request" }, { status: 500 })
  }
}
