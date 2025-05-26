import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { internal } from "./_generated/api"

// Get detailed analytics for a specific client
export const getClientAnalytics = query({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Verify client belongs to tenant
    const client = await ctx.db.get(args.clientId)
    if (!client || client.tenantId !== args.tenantId || client.isDeleted) {
      throw new Error("Client not found")
    }

    // Get all bookings for this client
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .collect()

    // Calculate service prices
    const serviceRevenue = {
      "Basic Wash": 29.99,
      "Interior Detailing": 89.99,
      "Exterior Detailing": 99.99,
      "Full Detailing": 179.99,
      "Ceramic Coating": 299.99,
      "Paint Correction": 349.99,
    }

    // Calculate metrics
    const totalBookings = bookings.length
    const completedBookings = bookings.filter((b) => b.status === "completed").length
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length
    const upcomingBookings = bookings.filter((b) => b.status === "scheduled" && b.dateTime > Date.now()).length

    // Calculate total spent
    const totalSpent = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => {
        return sum + (serviceRevenue[booking.service as keyof typeof serviceRevenue] || 99.99)
      }, 0)

    // Calculate average booking value
    const averageBookingValue = completedBookings > 0 ? totalSpent / completedBookings : 0

    // Get last booking date
    const sortedBookings = bookings.filter((b) => b.status === "completed").sort((a, b) => b.dateTime - a.dateTime)

    const lastBookingDate = sortedBookings[0]?.dateTime || null

    // Calculate service preferences
    const servicePreferences = bookings.reduce(
      (acc, booking) => {
        if (booking.status === "completed") {
          acc[booking.service] = (acc[booking.service] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // Get most frequent service
    const favoriteService = Object.entries(servicePreferences).sort(([, a], [, b]) => b - a)[0]?.[0] || null

    // Calculate booking frequency (average days between bookings)
    let bookingFrequency = null
    if (completedBookings > 1) {
      const completedDates = bookings
        .filter((b) => b.status === "completed")
        .map((b) => b.dateTime)
        .sort((a, b) => a - b)

      let totalDays = 0
      for (let i = 1; i < completedDates.length; i++) {
        totalDays += (completedDates[i] - completedDates[i - 1]) / (1000 * 60 * 60 * 24)
      }
      bookingFrequency = Math.round(totalDays / (completedDates.length - 1))
    }

    // Calculate lifetime value projection (based on average spend and frequency)
    const projectedAnnualValue =
      bookingFrequency && averageBookingValue ? (365 / bookingFrequency) * averageBookingValue : 0

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalSpent,
      averageBookingValue,
      lastBookingDate,
      favoriteService,
      servicePreferences,
      bookingFrequency,
      projectedAnnualValue,
      isVip: totalSpent > 1000,
      completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
    }
  },
})

// Get booking history for a client with pagination
export const getClientBookingHistory = query({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10

    // Verify client belongs to tenant
    const client = await ctx.db.get(args.clientId)
    if (!client || client.tenantId !== args.tenantId || client.isDeleted) {
      throw new Error("Client not found")
    }

    // Build query
    let bookingsQuery = ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .order("desc")

    // Apply cursor-based pagination
    if (args.cursor) {
      const cursorBooking = await ctx.db.get(args.cursor as Id<"bookings">)
      if (cursorBooking) {
        bookingsQuery = bookingsQuery.filter((q) => q.lt(q.field("_creationTime"), cursorBooking._creationTime))
      }
    }

    // Get bookings
    const bookings = await bookingsQuery.take(limit + 1)

    // Check if there are more results
    const hasMore = bookings.length > limit
    const results = hasMore ? bookings.slice(0, limit) : bookings
    const nextCursor = hasMore ? results[results.length - 1]._id : null

    return {
      bookings: results,
      nextCursor,
      hasMore,
    }
  },
})

// Update client lifetime value (called after booking completion)
export const updateClientLifetimeValue = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Get client analytics
    const analytics = await ctx.runQuery(internal.clientAnalytics.getClientAnalytics, {
      tenantId: args.tenantId,
      clientId: args.clientId,
    })

    // Update client with calculated values
    await ctx.db.patch(args.clientId, {
      totalSpent: analytics.totalSpent,
      lastBookingDate: analytics.lastBookingDate,
      isVip: analytics.isVip,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Batch update client analytics (for scheduled jobs)
export const batchUpdateClientAnalytics = mutation({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    // Get all active clients for the tenant
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect()

    let updated = 0
    const errors: string[] = []

    // Update each client's analytics
    for (const client of clients) {
      try {
        await ctx.runMutation(internal.clientAnalytics.updateClientLifetimeValue, {
          tenantId: args.tenantId,
          clientId: client._id,
        })
        updated++
      } catch (error) {
        errors.push(`Failed to update client ${client._id}: ${error}`)
      }
    }

    return {
      success: true,
      updated,
      total: clients.length,
      errors,
    }
  },
})
