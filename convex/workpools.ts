/**
 * @description      : Workpool implementation for auto-detailing business
 * @author           : rrome
 * @created          : 26/05/2025
 */
import { v } from "convex/values"
import { internalAction, internalMutation, mutation, query } from "./_generated/server"
import { internal } from "./_generated/api"
import { Workpool } from "@convex-dev/workpool"
import { components } from "./_generated/api"

// Create workpools for different business functions
export const notificationPool = new Workpool(components.notificationWorkpool, {
  maxParallelism: 20,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 5, initialBackoffMs: 1000, base: 2 },
  logLevel: "INFO",
})

export const bookingPool = new Workpool(components.bookingWorkpool, {
  maxParallelism: 5,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 500, base: 2 },
  logLevel: "INFO",
})

export const calendarSyncPool = new Workpool(components.calendarSyncWorkpool, {
  maxParallelism: 3, // Limit to avoid Google Calendar API rate limits
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 5, initialBackoffMs: 2000, base: 2 },
  logLevel: "INFO",
})

export const analyticsPool = new Workpool(components.analyticsWorkpool, {
  maxParallelism: 2, // Lower priority, limit resource usage
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 2, initialBackoffMs: 5000, base: 2 },
  logLevel: "INFO",
})

// Notification workpool functions
export const sendBookingConfirmationEmail = internalAction({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    clientId: v.id("clients"),
    emailTemplate: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate sending an email
    console.log(`Sending booking confirmation email for booking ${args.bookingId}`)

    // In a real implementation, you would:
    // 1. Fetch booking and client details
    // 2. Format the email using the template
    // 3. Send via a service like SendGrid or AWS SES

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    return {
      success: true,
      messageId: `email_${Math.random().toString(36).substring(2, 15)}`,
      sentAt: new Date().toISOString(),
    }
  },
})

export const notificationSent = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      bookingId: v.id("bookings"),
      notificationType: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    // Log the notification result
    await ctx.db.insert("notificationLogs", {
      tenantId: args.context.tenantId,
      bookingId: args.context.bookingId,
      type: args.context.notificationType,
      success: args.result.kind === "success",
      error: args.result.kind === "failed" ? args.result.error : null,
      messageId: args.result.kind === "success" ? args.result.returnValue.messageId : null,
      sentAt: Date.now(),
    })

    // If failed, we could trigger a fallback notification method
    if (args.result.kind === "failed") {
      console.error(`Failed to send ${args.context.notificationType} notification:`, args.result.error)
    }
  },
})

// Booking workpool functions
export const processBookingRequest = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    dateTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for conflicts
    const conflicts = await ctx.db
      .query("bookings")
      .withIndex(
        "by_tenant_time",
        (q) =>
          q
            .eq("tenantId", args.tenantId)
            .gte("dateTime", args.dateTime - 3600000) // 1 hour before
            .lte("dateTime", args.dateTime + 3600000), // 1 hour after
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect()

    if (conflicts.length > 0) {
      throw new Error("Booking time conflicts with existing appointment")
    }

    // Get service details
    const service = await ctx.db.get(args.serviceId)
    if (!service) {
      throw new Error("Service not found")
    }

    // Create booking
    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      clientId: args.clientId,
      serviceId: args.serviceId,
      serviceName: service.name,
      dateTime: args.dateTime,
      endTime: args.dateTime + service.durationMinutes * 60 * 1000,
      status: "scheduled",
      notes: args.notes || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return bookingId
  },
})

export const bookingProcessed = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      clientId: v.id("clients"),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      const bookingId = args.result.returnValue

      // Schedule notification
      await notificationPool.enqueueAction(
        ctx,
        internal.workpools.sendBookingConfirmationEmail,
        {
          tenantId: args.context.tenantId,
          bookingId,
          clientId: args.context.clientId,
          emailTemplate: "booking_confirmation",
        },
        {
          onComplete: internal.workpools.notificationSent,
          context: {
            tenantId: args.context.tenantId,
            bookingId,
            notificationType: "booking_confirmation",
          },
        },
      )

      // Schedule calendar sync
      await calendarSyncPool.enqueueAction(
        ctx,
        internal.workpools.syncBookingToCalendar,
        {
          tenantId: args.context.tenantId,
          bookingId,
        },
        {
          onComplete: internal.workpools.calendarSyncCompleted,
          context: {
            tenantId: args.context.tenantId,
            bookingId,
          },
        },
      )
    } else if (args.result.kind === "failed") {
      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "booking_creation",
        error: args.result.error,
        timestamp: Date.now(),
      })
    }
  },
})

// Calendar sync workpool functions
export const syncBookingToCalendar = internalAction({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    // In a real implementation, you would:
    // 1. Fetch booking details
    // 2. Get Google Calendar credentials for the tenant
    // 3. Create or update calendar event

    console.log(`Syncing booking ${args.bookingId} to Google Calendar`)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      eventId: `event_${Math.random().toString(36).substring(2, 15)}`,
      syncedAt: new Date().toISOString(),
    }
  },
})

export const calendarSyncCompleted = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      bookingId: v.id("bookings"),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Update booking with calendar event ID
      await ctx.db.patch(args.context.bookingId, {
        googleEventId: args.result.returnValue.eventId,
        calendarSynced: true,
        updatedAt: Date.now(),
      })
    } else if (args.result.kind === "failed") {
      // Log the error but don't fail the booking
      await ctx.db.insert("integrationErrors", {
        tenantId: args.context.tenantId,
        service: "google_calendar",
        resourceId: args.context.bookingId,
        error: args.result.error,
        timestamp: Date.now(),
      })

      // Mark as not synced
      await ctx.db.patch(args.context.bookingId, {
        calendarSynced: false,
        updatedAt: Date.now(),
      })
    }
  },
})

// Analytics workpool functions
export const updateClientAnalytics = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Get all client bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect()

    // Calculate metrics
    const totalBookings = bookings.length
    const completedBookings = bookings.filter((b) => b.status === "completed").length
    const canceledBookings = bookings.filter((b) => b.status === "cancelled").length
    const totalSpent = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Get or create analytics record
    const existingAnalytics = await ctx.db
      .query("clientAnalytics")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first()

    if (existingAnalytics) {
      await ctx.db.patch(existingAnalytics._id, {
        totalBookings,
        completedBookings,
        canceledBookings,
        totalSpent,
        lastBookingDate: bookings.length > 0 ? Math.max(...bookings.map((b) => b.dateTime)) : null,
        updatedAt: Date.now(),
      })
      return existingAnalytics._id
    } else {
      return await ctx.db.insert("clientAnalytics", {
        tenantId: args.tenantId,
        clientId: args.clientId,
        totalBookings,
        completedBookings,
        canceledBookings,
        totalSpent,
        lastBookingDate: bookings.length > 0 ? Math.max(...bookings.map((b) => b.dateTime)) : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})

// Public API for creating bookings with workpool
export const createBookingWithWorkpool = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    dateTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Enqueue the booking processing to the booking workpool
    const workId = await bookingPool.enqueueMutation(ctx, internal.workpools.processBookingRequest, args, {
      onComplete: internal.workpools.bookingProcessed,
      context: {
        tenantId: args.tenantId,
        clientId: args.clientId,
      },
    })

    return { workId }
  },
})

// Query to check booking status
export const getBookingWorkStatus = query({
  args: {
    workId: v.string(),
  },
  handler: async (ctx, args) => {
    return await bookingPool.status(args.workId)
  },
})

// Cancel a booking work item
export const cancelBookingWork = mutation({
  args: {
    workId: v.string(),
  },
  handler: async (ctx, args) => {
    await bookingPool.cancel(ctx, args.workId)
    return { success: true }
  },
})
