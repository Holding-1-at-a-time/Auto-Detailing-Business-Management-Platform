import { query } from "./_generated/server"
import { v } from "convex/values"

export const getDashboardStats = query({
  args: {
    tenantId: v.id("tenants"),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const dateRange = args.dateRange || {
      start: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      end: now,
    }

    // Get all bookings for the tenant
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.and(q.gte(q.field("createdAt"), dateRange.start), q.lte(q.field("createdAt"), dateRange.end)))
      .collect()

    // Get all clients for the tenant
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect()

    // Calculate stats
    const totalBookings = bookings.length
    const completedBookings = bookings.filter((b) => b.status === "completed").length
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length
    const upcomingBookings = bookings.filter((b) => b.status === "scheduled" && b.dateTime > now).length

    const totalClients = clients.length
    const newClients = clients.filter((c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end).length

    // Calculate revenue (simplified - in real app, would track actual payments)
    const serviceRevenue = {
      "Basic Wash": 29.99,
      "Interior Detailing": 89.99,
      "Exterior Detailing": 99.99,
      "Full Detailing": 179.99,
      "Ceramic Coating": 299.99,
      "Paint Correction": 349.99,
    }

    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => {
        return sum + (serviceRevenue[booking.service] || 99.99)
      }, 0)

    // Service breakdown
    const serviceBreakdown = bookings.reduce(
      (acc, booking) => {
        acc[booking.service] = (acc[booking.service] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Booking trends (by week)
    const weeklyBookings = []
    const weekMs = 7 * 24 * 60 * 60 * 1000
    for (let i = 0; i < 4; i++) {
      const weekEnd = now - i * weekMs
      const weekStart = weekEnd - weekMs
      const weekBookings = bookings.filter((b) => b.createdAt >= weekStart && b.createdAt < weekEnd).length
      weeklyBookings.unshift({
        week: `Week ${4 - i}`,
        bookings: weekBookings,
      })
    }

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalClients,
      newClients,
      totalRevenue,
      serviceBreakdown,
      weeklyBookings,
      completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
    }
  },
})

export const getBookingTrends = query({
  args: {
    tenantId: v.id("tenants"),
    period: v.optional(v.string()), // "daily", "weekly", "monthly"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const period = args.period || "daily"
    const limit = args.limit || 30
    const now = Date.now()

    // Calculate time range based on period
    let timeRange: number
    let groupBy: number

    switch (period) {
      case "daily":
        timeRange = limit * 24 * 60 * 60 * 1000
        groupBy = 24 * 60 * 60 * 1000
        break
      case "weekly":
        timeRange = limit * 7 * 24 * 60 * 60 * 1000
        groupBy = 7 * 24 * 60 * 60 * 1000
        break
      case "monthly":
        timeRange = limit * 30 * 24 * 60 * 60 * 1000
        groupBy = 30 * 24 * 60 * 60 * 1000
        break
      default:
        timeRange = 30 * 24 * 60 * 60 * 1000
        groupBy = 24 * 60 * 60 * 1000
    }

    const startDate = now - timeRange

    // Get bookings within the time range
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect()

    // Group bookings by period
    const trends = new Map<number, number>()

    bookings.forEach((booking) => {
      const periodKey = Math.floor(booking.createdAt / groupBy) * groupBy
      trends.set(periodKey, (trends.get(periodKey) || 0) + 1)
    })

    // Convert to array and sort
    const trendData = Array.from(trends.entries())
      .map(([timestamp, count]) => ({
        date: new Date(timestamp).toISOString(),
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return trendData
  },
})

export const getTopServices = query({
  args: {
    tenantId: v.id("tenants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5

    // Get all completed bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant_and_status", (q) => q.eq("tenantId", args.tenantId).eq("status", "completed"))
      .collect()

    // Count services
    const serviceCounts = bookings.reduce(
      (acc, booking) => {
        acc[booking.service] = (acc[booking.service] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Sort and limit
    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([service, count]) => ({
        service,
        count,
        percentage: Math.round((count / bookings.length) * 100),
      }))

    return topServices
  },
})

export const getClientRetention = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    // Get all clients
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect()

    // Get all bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    // Calculate retention metrics
    const clientBookingCounts = new Map<string, number>()

    bookings.forEach((booking) => {
      const count = clientBookingCounts.get(booking.clientId) || 0
      clientBookingCounts.set(booking.clientId, count + 1)
    })

    const oneTimeClients = Array.from(clientBookingCounts.values()).filter((count) => count === 1).length

    const repeatClients = Array.from(clientBookingCounts.values()).filter((count) => count > 1).length

    const loyalClients = Array.from(clientBookingCounts.values()).filter((count) => count >= 5).length

    const totalClientsWithBookings = clientBookingCounts.size

    return {
      totalClients: clients.length,
      oneTimeClients,
      repeatClients,
      loyalClients,
      retentionRate: totalClientsWithBookings > 0 ? Math.round((repeatClients / totalClientsWithBookings) * 100) : 0,
      averageBookingsPerClient:
        totalClientsWithBookings > 0 ? (bookings.length / totalClientsWithBookings).toFixed(1) : "0",
    }
  },
})
