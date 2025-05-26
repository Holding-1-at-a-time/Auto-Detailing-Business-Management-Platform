"use server"

import { convex } from "@/lib/convex/convex-client"
import { revalidatePath } from "next/cache"

export async function handleBookingRequest(tenantId: string, message: string, threadId?: string) {
  try {
    let currentThreadId = threadId

    if (!currentThreadId) {
      // Create a new thread
      const { threadId: newThreadId } = await convex.mutation("agent.createThread", {
        tenantId,
        title: "Booking Request",
        userId: "current-user", // In a real app, get this from auth
      })

      currentThreadId = newThreadId
    }

    // Start the booking workflow
    const workflowId = await convex.mutation("bookingWorkflow.startBookingWorkflow", {
      tenantId,
      threadId: currentThreadId,
      userId: "current-user", // In a real app, get this from auth
      prompt: message,
    })

    revalidatePath(`/${tenantId}/bookings`)

    return {
      success: true,
      threadId: currentThreadId,
      workflowId,
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
    // Continue the thread
    await convex.mutation("agent.continueThread", {
      tenantId,
      threadId,
      userId: "current-user", // In a real app, get this from auth
    })

    // Generate a response
    const result = await convex.action("agent.generateText", {
      tenantId,
      threadId,
      prompt: message,
      userId: "current-user", // In a real app, get this from auth
    })

    revalidatePath(`/${tenantId}/bookings`)

    return {
      success: true,
      text: result.text,
    }
  } catch (error) {
    console.error("Error continuing booking conversation:", error)
    return {
      success: false,
      error: "Failed to continue conversation",
    }
  }
}

export async function getWorkflowStatus(tenantId: string, workflowId: string) {
  try {
    const status = await convex.query("bookingWorkflow.getWorkflowStatus", {
      tenantId,
      workflowId,
    })

    return {
      success: true,
      status,
    }
  } catch (error) {
    console.error("Error getting workflow status:", error)
    return {
      success: false,
      error: "Failed to get workflow status",
    }
  }
}

export async function cancelWorkflow(tenantId: string, workflowId: string) {
  try {
    await convex.mutation("bookingWorkflow.cancelWorkflow", {
      tenantId,
      workflowId,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error canceling workflow:", error)
    return {
      success: false,
      error: "Failed to cancel workflow",
    }
  }
}
