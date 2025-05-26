/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 08:30:17
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { v } from "convex/values"
import { WorkflowManager } from "@convex-dev/workflow"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { vWorkflowId } from "@convex-dev/workflow"
import { vResultValidator } from "@convex-dev/workpool"
import { componentsGeneric } from "convex/server"

// Initialize the workflow manager with retry behavior
export const workflow = new WorkflowManager(componentsGeneric.workflow, {
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
  handler: async (
    step,
    args,
  ): Promise<{
    tenantId: string
    success: boolean
    bookingId?: string
    message: string
    threadId: string
  }> => {
    // Step 1: Parse the booking request using the agent
    const parsedRequest = await step.runAction(
      internal.agent.generateObjectAction,
      {
        tenantId: args.tenantId,
        threadId: args.threadId,
        userId: args.userId,
        prompt: args.prompt,
      },
      { retry: true, name: "PARSE_BOOKING_REQUEST" },
    )

    // Step 2: Find or create the client
    let {clientId} = args
    if (!clientId) {
      // Try to find the client first
      const clients = await step.runQuery(
        internal.scheduling.findClientBySearch,
        {
          tenantId: args.tenantId,
          search: parsedRequest.clientName,
        },
        { name: "FIND_CLIENT" },
      )

      if (clients.length > 0) {
        // Use the first matching client
        clientId = clients[0].id as Id<"clients">
      } else {
        // Create a new client
        const clientResult = await step.runMutation(
          internal.scheduling.createClientInternal,
          {
            tenantId: args.tenantId,
            name: parsedRequest.clientName,
            email: parsedRequest.clientEmail,
            phone: parsedRequest.clientPhone,
            notes: `Created during booking workflow for ${parsedRequest.service}`,
          },
          { name: "CREATE_CLIENT" },
        )
        clientId = clientResult as Id<"clients">
      }
    }

    // Step 3: Check availability for the requested date and time
    const dateObj = new Date(`${parsedRequest.date}T${parsedRequest.time}`)
    const availableSlots = await step.runQuery(
      internal.scheduling.getAvailableTimeSlots,
      {
        tenantId: args.tenantId,
        date: parsedRequest.date,
        service: parsedRequest.service,
      },
      { name: "CHECK_AVAILABILITY" },
    )

    // Find if the requested time is available
    const requestedTimeString = parsedRequest.time.substring(0, 5) // Format as HH:MM
    const isTimeAvailable = availableSlots.some((slot) => slot.time === requestedTimeString && slot.available)

    if (!isTimeAvailable) {
      // Step 3a: If requested time is not available, suggest alternatives
      const availableTimes = availableSlots
        .filter((slot) => slot.available)
        .map((slot) => slot.time)
        .slice(0, 3) // Get up to 3 alternatives

      // Generate a response with alternative times
      await step.runAction(
        internal.agent.generateTextAction,
        {
          tenantId: args.tenantId,
          threadId: args.threadId,
          userId: args.userId,
          prompt: `The requested time ${requestedTimeString} is not available for ${parsedRequest.service} on ${parsedRequest.date}. Available times are: ${availableTimes.join(", ")}. Please suggest these alternatives to the client.`,
        },
        { retry: true, name: "SUGGEST_ALTERNATIVES" },
      )

      return {
        success: false,
        message: `Requested time ${requestedTimeString} is not available. Alternatives suggested.`,
        threadId: args.threadId,
      }
    }

    // Step 4: Create the booking
    const bookingId = await step.runMutation(
      internal.scheduling.createBookingInternal,
      {
        tenantId: args.tenantId,
        clientId: clientId,
        dateTime: dateObj.getTime(),
        service: parsedRequest.service,
        notes: parsedRequest.notes || "",
      },
      { retry: true, name: "CREATE_BOOKING" },
    )

    // Step 5: Send confirmation notification
    await step.runMutation(
      internal.notifications.sendBookingConfirmation,
      {
        tenantId: args.tenantId,
        clientId: clientId,
        bookingId: bookingId as Id<"bookings">,
        dateTime: dateObj.getTime(),
        service: parsedRequest.service,
      },
      { retry: true, name: "SEND_CONFIRMATION" },
    )

    // Step 6: Generate confirmation message for the user
    await step.runAction(
      internal.agent.generateTextAction,
      {
        tenantId: args.tenantId,
        threadId: args.threadId,
        userId: args.userId,
        prompt: `Booking confirmed! I've scheduled your ${parsedRequest.service} appointment for ${parsedRequest.date} at ${requestedTimeString}. Your booking ID is ${bookingId}. Is there anything else you need help with?`,
      },
      { retry: true, name: "GENERATE_CONFIRMATION" },
    )

    // Step 7: Update thread with booking information
    await step.runMutation(
      internal.agent.updateThread,
      {
        tenantId: args.tenantId,
        threadId: args.threadId,
        title: `Booking: ${parsedRequest.service} on ${parsedRequest.date}`,
        summary: `${parsedRequest.clientName} booked ${parsedRequest.service} for ${parsedRequest.date} at ${requestedTimeString}`,
        status: "completed",
      },
      { name: "UPDATE_THREAD" },
    )

    return {
      success: true,
      bookingId: bookingId as string,
      message: "Booking created successfully",
      threadId: args.threadId,
    }
  },
})

// Define a workflow for handling booking rescheduling
export const rescheduleWorkflow = workflow.define({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    bookingId: v.id("bookings"),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (
    step,
    args,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    // Step 1: Get the current booking details
    const booking = await step.runQuery(
      internal.scheduling.getBookingById,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
      },
      { name: "GET_BOOKING" },
    )

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      }
    }

    // Step 2: Check availability for the new date and time
    const availableSlots = await step.runQuery(
      internal.scheduling.getAvailableTimeSlots,
      {
        tenantId: args.tenantId,
        date: args.newDate,
        service: booking.service,
      },
      { name: "CHECK_AVAILABILITY" },
    )

    // Find if the requested time is available
    const isTimeAvailable = availableSlots.some((slot) => slot.time === args.newTime && slot.available)

    if (!isTimeAvailable) {
      // Generate a response with the issue
      await step.runAction(
        internal.agent.generateTextAction,
        {
          tenantId: args.tenantId,
          threadId: args.threadId,
          userId: args.userId,
          prompt: `The requested time ${args.newTime} is not available for rescheduling on ${args.newDate}. Please suggest alternative times.`,
        },
        { retry: true, name: "SUGGEST_ALTERNATIVES" },
      )

      return {
        success: false,
        message: `Requested time ${args.newTime} is not available for rescheduling.`,
      }
    }

    // Step 3: Update the booking
    const dateObj = new Date(`${args.newDate}T${args.newTime}`)
    await step.runMutation(
      internal.scheduling.updateBookingInternal,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
        dateTime: dateObj.getTime(),
      },
      { retry: true, name: "UPDATE_BOOKING" },
    )

    // Step 4: Send rescheduling notification
    await step.runMutation(
      internal.notifications.sendBookingUpdate,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
        updateType: "reschedule",
        dateTime: dateObj.getTime(),
      },
      { retry: true, name: "SEND_NOTIFICATION" },
    )

    // Step 5: Generate confirmation message
    await step.runAction(
      internal.agent.generateTextAction,
      {
        tenantId: args.tenantId,
        threadId: args.threadId,
        userId: args.userId,
        prompt: `Your booking has been successfully rescheduled to ${args.newDate} at ${args.newTime}. Is there anything else you need help with?`,
      },
      { retry: true, name: "GENERATE_CONFIRMATION" },
    )

    return {
      success: true,
      message: "Booking rescheduled successfully",
    }
  },
})

// Define a workflow for handling booking cancellations
export const cancellationWorkflow = workflow.define({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (
    step,
    args,
  ): Promise<{
    success: boolean
    message: string
  }> => {
    // Step 1: Get the current booking details
    const booking = await step.runQuery(
      internal.scheduling.getBookingById,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
      },
      { name: "GET_BOOKING" },
    )

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      }
    }

    // Step 2: Cancel the booking
    await step.runMutation(
      internal.scheduling.cancelBookingInternal,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
        reason: args.reason || "Cancelled by user",
      },
      { retry: true, name: "CANCEL_BOOKING" },
    )

    // Step 3: Send cancellation notification
    await step.runMutation(
      internal.notifications.sendBookingUpdate,
      {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
        updateType: "cancellation",
        reason: args.reason,
      },
      { retry: true, name: "SEND_NOTIFICATION" },
    )

    // Step 4: Generate confirmation message
    await step.runAction(
      internal.agent.generateTextAction,
      {
        tenantId: args.tenantId,
        threadId: args.threadId,
        userId: args.userId,
        prompt: `Your booking for ${booking.service} on ${new Date(booking.dateTime).toLocaleDateString()} has been cancelled. Is there anything else you need help with?`,
      },
      { retry: true, name: "GENERATE_CONFIRMATION" },
    )

    return {
      success: true,
      message: "Booking cancelled successfully",
    }
  },
})

// Start the booking workflow
export const startBookingWorkflow = mutation({
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
        threadId: args.threadId,
      },
    })
  },
})

// Start the reschedule workflow
export const startRescheduleWorkflow = mutation({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    bookingId: v.id("bookings"),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (ctx, args) => {
    return await workflow.start(ctx, internal.bookingWorkflow.rescheduleWorkflow, args, {
      onComplete: internal.bookingWorkflow.handleWorkflowComplete,
      context: {
        tenantId: args.tenantId,
        userId: args.userId,
        threadId: args.threadId,
        operation: "reschedule",
      },
    })
  },
})

// Start the cancellation workflow
export const startCancellationWorkflow = mutation({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.string(),
    userId: v.string(),
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await workflow.start(ctx, internal.bookingWorkflow.cancellationWorkflow, args, {
      onComplete: internal.bookingWorkflow.handleWorkflowComplete,
      context: {
        tenantId: args.tenantId,
        userId: args.userId,
        threadId: args.threadId,
        operation: "cancellation",
      },
    })
  },
})

// Handle workflow completion
export const handleWorkflowComplete = mutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.any(),
  },
  handler: async (ctx, args) => {
    const { tenantId, userId, threadId, operation = "booking" } = args.context

    if (args.result.kind === "success") {
      // Log successful workflow completion
      console.log(`${operation} workflow completed successfully: ${args.workflowId}`)

      // Update thread status
      await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .first()
        .then((thread) => {
          if (thread) {
            ctx.db.patch(thread._id, {
              status: "completed",
              updatedAt: Date.now(),
            })
          }
        })

      // Clean up the workflow
      await workflow.cleanup(ctx, args.workflowId)
    } else if (args.result.kind === "error") {
      // Log error
      console.error(`${operation} workflow failed: ${args.result.error}`)

      // Update thread status
      await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .first()
        .then((thread) => {
          if (thread) {
            ctx.db.patch(thread._id, {
              status: "failed",
              updatedAt: Date.now(),
            })
          }
        })

      // Insert error notification
      await ctx.db.insert("notifications", {
        tenantId,
        type: "workflow_error",
        resourceId: args.workflowId,
        message: `${operation} workflow failed: ${args.result.error}`,
        isRead: false,
        createdAt: Date.now(),
      })

      // Send error message to the thread
      try {
        await ctx.runAction(internal.agent.generateTextAction, {
          tenantId,
          threadId,
          userId,
          prompt: `I'm sorry, but I encountered an error while processing your ${operation} request. Please try again or contact support if the issue persists.`,
        })
      } catch (error) {
        console.error("Failed to send error message to thread:", error)
      }

      // Clean up the workflow
      await workflow.cleanup(ctx, args.workflowId)
    } else if (args.result.kind === "canceled") {
      console.log(`${operation} workflow was canceled: ${args.workflowId}`)

      // Update thread status
      await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .first()
        .then((thread) => {
          if (thread) {
            ctx.db.patch(thread._id, {
              status: "canceled",
              updatedAt: Date.now(),
            })
          }
        })

      // Clean up the workflow
      await workflow.cleanup(ctx, args.workflowId)
    }
  },
})

// Get workflow status
export const getWorkflowStatus = query({
  args: {
    tenantId: v.id("tenants"),
    workflowId: v.string(),
  },
  handler: async (ctx, args) => {
    return await workflow.status(ctx, args.workflowId)
  },
})

// Cancel a workflow
export const cancelWorkflow = mutation({
  args: {
    tenantId: v.id("tenants"),
    workflowId: v.string(),
  },
  handler: async (ctx, args) => {
    await workflow.cancel(ctx, args.workflowId)
    return { success: true }
  },
})
