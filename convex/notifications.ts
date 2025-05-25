import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Get notifications for a tenant
export const getNotifications = query({
  args: {
    tenantId: v.id("tenants"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")

    if (args.unreadOnly) {
      notificationsQuery = notificationsQuery.filter((q) => q.eq(q.field("isRead"), false))
    }

    if (args.limit) {
      notificationsQuery = notificationsQuery.take(args.limit)
    } else {
      notificationsQuery = notificationsQuery.take(50) // Default limit
    }

    return await notificationsQuery.collect()
  },
})

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: {
    tenantId: v.id("tenants"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)

    if (!notification) {
      throw new Error("Notification not found")
    }

    // Ensure notification belongs to the specified tenant
    if (notification.tenantId !== args.tenantId) {
      throw new Error("Notification does not belong to this tenant")
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      updatedAt: Date.now(),
    })

    return args.notificationId
  },
})

// Send booking confirmation notification
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

    // Create notification in the system
    const notificationId = await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "booking_confirmation",
      resourceId: args.bookingId,
      message: `Booking confirmed for ${client.name}: ${args.service} on ${new Date(args.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    // If client has email, send email notification
    if (client.email) {
      // In a real implementation, you would integrate with an email service
      console.log(`Sending email to ${client.email} about booking confirmation`)
    }

    // If client has phone, send SMS notification
    if (client.phone) {
      // In a real implementation, you would integrate with an SMS service
      console.log(`Sending SMS to ${client.phone} about booking confirmation`)
    }

    return notificationId
  },
})
