import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Send a booking confirmation notification
export const sendBookingConfirmation = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    bookingId: v.id("bookings"),
    dateTime: v.number(),
    service: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get client details
    const client = await ctx.db.get(args.clientId)
    if (!client) {
      throw new Error("Client not found")
    }

    // Create notification for the tenant
    const notificationId = await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "booking_confirmation",
      resourceId: args.bookingId,
      message: `Booking confirmed for ${client.name}: ${args.service} on ${new Date(args.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    // In a real implementation, you would also send an email or SMS to the client
    // This could be done via a third-party service like SendGrid or Twilio

    return notificationId
  },
})

// Send a booking update notification
export const sendBookingUpdate = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    updateType: v.string(), // "reschedule", "cancellation", etc.
    dateTime: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get booking details
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error("Booking not found")
    }

    // Get client details
    const client = await ctx.db.get(booking.clientId)
    if (!client) {
      throw new Error("Client not found")
    }

    let message = ""
    if (args.updateType === "reschedule" && args.dateTime) {
      message = `Booking rescheduled for ${client.name}: ${booking.service} moved to ${new Date(args.dateTime).toLocaleString()}`
    } else if (args.updateType === "cancellation") {
      message = `Booking cancelled for ${client.name}: ${booking.service} on ${new Date(booking.dateTime).toLocaleString()}`
      if (args.reason) {
        message += ` - Reason: ${args.reason}`
      }
    } else {
      message = `Booking updated for ${client.name}: ${booking.service}`
    }

    // Create notification for the tenant
    const notificationId = await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: `booking_${args.updateType}`,
      resourceId: args.bookingId,
      message,
      isRead: false,
      createdAt: now,
    })

    // In a real implementation, you would also send an email or SMS to the client

    return notificationId
  },
})

// Get notifications for a tenant
export const getNotifications = query({
  args: {
    tenantId: v.id("tenants"),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("notifications").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    if (!args.includeRead) {
      query = query.filter((q) => q.eq(q.field("isRead"), false))
    }

    return await query.order("desc").take(args.limit || 10)
  },
})

// Mark a notification as read
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect()

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        updatedAt: Date.now(),
      })
    }

    return { success: true, count: notifications.length }
  },
})
