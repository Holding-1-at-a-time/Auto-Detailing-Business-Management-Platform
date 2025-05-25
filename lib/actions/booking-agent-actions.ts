"use server"

import { convex } from "@/lib/convex/convex-client"
import { parseBookingRequest } from "@/lib/ai/booking-parser"
import { revalidatePath } from "next/cache"

export async function handleBookingRequest(tenantId: string, message: string) {
  try {
    // Parse the booking request
    const parsedRequest = await parseBookingRequest(message)

    // Create a new thread
    const { threadId } = await convex.mutation("agent.createThread", {
      tenantId,
      title: `Booking for ${parsedRequest.service}`,
    })

    // Start the booking workflow
    await convex.mutation("bookingWorkflow.startBookingWorkflow", {
      tenantId,
      threadId,
      userId: "current-user", // In a real app, get this from auth
      prompt: message,
    })

    revalidatePath(`/${tenantId}/bookings`)

    return {
      success: true,
      threadId,
      parsedRequest,
    }
  } catch (error) {
    console.error("Error handling booking request:", error)
    return {
      success: false,
      error: "Failed to process booking request",
    }
  }
}

export async function continueBookingConversation(tenantId: string, threadId: string, message: string) {
  try {
    await convex.mutation("agent.continueThread", {
      tenantId,
      threadId,
      prompt: message,
    })

    revalidatePath(`/${tenantId}/bookings`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error continuing booking conversation:", error)
    return {
      success: false,
      error: "Failed to continue conversation",
    }
  }
}
