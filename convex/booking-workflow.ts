import { v } from "convex/values"
import { WorkflowManager } from "@convex-dev/workflow"
import { components } from "./_generated/api"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { mutation } from "./_generated/server"

// Initialize the workflow manager
export const workflow = new WorkflowManager(components.workflow, {
  defaultRetryBehavior: {
    maxAttempts: 3,
    initialBackoffMs: 100,
    base: 2,
  },
  workpoolOptions: {
    maxParallelism: 10,
  },
})

// Define the booking workflow
export const bookingWorkflow = workflow.define({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    prompt: v.string(),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (step, args): Promise<string> => {
    // Step 1: Generate a response to the booking request using the agent
    const agentResponse = await step.runAction(internal.agent.generateBookingResponse, {
      threadId: args.threadId,
      userId: args.userId,
      prompt: args.prompt,
      tenantId: args.tenantId,
    })

    // Step 2: If a booking was created, send a notification
    if (agentResponse.includes("BOOKING_CONFIRMED")) {
      // Extract booking details from the response
      const bookingDetails = extractBookingDetails(agentResponse)

      // Send confirmation notification
      await step.runMutation(internal.notifications.sendBookingConfirmation, {
        tenantId: args.tenantId,
        clientId: bookingDetails.clientId as Id<"clients">,
        bookingId: bookingDetails.bookingId as Id<"bookings">,
        dateTime: bookingDetails.dateTime,
        service: bookingDetails.service,
      })
    }

    return agentResponse
  },
})

// Helper function to extract booking details from agent response
function extractBookingDetails(response: string) {
  // This is a simple implementation - in production, you'd want more robust parsing
  const bookingIdMatch = response.match(/BOOKING_ID:([a-zA-Z0-9]+)/)
  const clientIdMatch = response.match(/CLIENT_ID:([a-zA-Z0-9]+)/)
  const dateTimeMatch = response.match(/DATETIME:(\d+)/)
  const serviceMatch = response.match(/SERVICE:([^,]+)/)

  return {
    bookingId: bookingIdMatch ? bookingIdMatch[1] : null,
    clientId: clientIdMatch ? clientIdMatch[1] : null,
    dateTime: dateTimeMatch ? Number.parseInt(dateTimeMatch[1]) : null,
    service: serviceMatch ? serviceMatch[1] : null,
  }
}

// Start the booking workflow
export const startBookingWorkflow = workflow.startMutation({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    prompt: v.string(),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    return await workflow.start(ctx, internal.bookingWorkflow.bookingWorkflow, args, {
      onComplete: internal.bookingWorkflow.handleWorkflowComplete,
      context: {
        tenantId: args.tenantId,
        userId: args.userId,
      },
    })
  },
})

// Handle workflow completion
export const handleWorkflowComplete = mutation({
  args: {
    workflowId: v.string(),
    result: v.any(),
    context: v.any(),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId } = args.context

    if (args.result.kind === "success") {
      // Log successful workflow completion
      console.log(`Booking workflow completed successfully: ${args.workflowId}`)

      // Clean up the workflow
      await workflow.cleanup(ctx, args.workflowId)
    } else if (args.result.kind === "error") {
      // Log error and potentially retry or notify admin
      console.error(`Booking workflow failed: ${args.result.error}`)

      // Insert error notification
      await ctx.db.insert("notifications", {
        tenantId,
        type: "workflow_error",
        resourceId: args.workflowId,
        message: `Booking workflow failed: ${args.result.error}`,
        isRead: false,
        createdAt: Date.now(),
      })

      // Clean up the workflow
      await workflow.cleanup(ctx, args.workflowId)
    }
  },
})
