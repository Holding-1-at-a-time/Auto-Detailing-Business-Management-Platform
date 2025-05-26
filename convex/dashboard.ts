import { query } from "./_generated/server"
import { v } from "convex/values"

// Get comprehensive dashboard data in a single query
export const getDashboardData = query({
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

    // Parallel queries for better performance
    const [bookings, clients, notifications, tenantSettings] = await Promise.all([
      // Get bookings
      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.and(q.gte(q.field("createdAt"), dateRange.start), q.lte(q.field("createdAt"), dateRange.end)))
        .collect(),

      // Get active clients
      ctx.db
        .query("clients")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect(),

      // Get unread notifications
      ctx.db
        .query("notifications")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.eq(q.field("isRead"), false))
        .order("desc")
        .take(5),

      // Get tenant settings
      ctx.db
        .query("tenantSettings")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
        .first(),
    ])

    // Calculate key metrics
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayBookings = bookings.filter((b) => b.dateTime >= todayStart.getTime())

    const upcomingBookings = bookings.filter((b) => b.status === "scheduled" && b.dateTime > now).slice(0, 5)

    // Revenue calculation
    const serviceRevenue = {
      "Basic Wash": 29.99,
      "Interior Detailing": 89.99,
      "Exterior Detailing": 99.99,
      "Full Detailing": 179.99,
      "Ceramic Coating": 299.99,
      "Paint Correction": 349.99,
    }

    const revenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => {
        return sum + (serviceRevenue[booking.service as keyof typeof serviceRevenue] || 99.99)
      }, 0)

    // Client metrics
    const newClients = clients.filter((c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end).length

    const vipClients = clients.filter((c) => c.isVip).length

    // Service breakdown
    const serviceBreakdown = bookings.reduce(
      (acc, booking) => {
        acc[booking.service] = (acc[booking.service] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Daily booking trend
    const dailyTrend = new Map<string, number>()
    bookings.forEach((booking) => {
      const date = new Date(booking.dateTime).toISOString().split("T")[0]
      dailyTrend.set(date, (dailyTrend.get(date) || 0) + 1)
    })

    const trendData = Array.from(dailyTrend.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7) // Last 7 days

    return {
      summary: {
        totalBookings: bookings.length,
        todayBookings: todayBookings.length,
        completedBookings: bookings.filter((b) => b.status === "completed").length,
        cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
        totalRevenue: revenue,
        totalClients: clients.length,
        newClients,
        vipClients,
        unreadNotifications: notifications.length,
      },
      upcomingBookings: upcomingBookings.map((b) => {
        const client = clients.find((c) => c._id === b.clientId)
        return {
          ...b,
          clientName: client?.name || "Unknown",
        }
      }),
      notifications,
      serviceBreakdown,
      dailyTrend: trendData,
      settings: tenantSettings,
    }
  },
})

// Get real-time updates for dashboard
export const getDashboardUpdates = query({
  args: {
    tenantId: v.id("tenants"),
    lastSync: v.number(),
  },
  handler: async (ctx, args) => {
    // Get updates since last sync
    const [newBookings, updatedBookings, newNotifications] = await Promise.all([
      // New bookings
      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.gt(q.field("createdAt"), args.lastSync))
        .collect(),

      // Updated bookings
      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.and(q.gt(q.field("updatedAt"), args.lastSync), q.lte(q.field("createdAt"), args.lastSync)))
        .collect(),

      // New notifications
      ctx.db
        .query("notifications")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.gt(q.field("createdAt"), args.lastSync))
        .order("desc")
        .collect(),
    ])

    return {
      newBookings,
      updatedBookings,
      newNotifications,
      timestamp: Date.now(),
    }
  },
})
