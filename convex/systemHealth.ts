import { query } from "./_generated/server"
import { v } from "convex/values"

// System health check
export const checkHealth = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const checks = {
      database: true,
      queries: true,
      mutations: true,
      timestamp: Date.now(),
    }

    try {
      // Test database read
      if (args.tenantId) {
        const tenant = await ctx.db.get(args.tenantId)
        checks.database = !!tenant
      }

      // Test query performance
      const startTime = Date.now()
      const bookings = await ctx.db.query("bookings").take(1)
      const queryTime = Date.now() - startTime
      checks.queries = queryTime < 1000 // Should be under 1 second

      return {
        status: "healthy",
        checks,
        performance: {
          queryTime,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        checks,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
})

// Get system statistics
export const getSystemStats = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const [totalBookings, totalClients, totalNotifications, activeBookings] = await Promise.all([
      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .collect()
        .then((b) => b.length),

      ctx.db
        .query("clients")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect()
        .then((c) => c.length),

      ctx.db
        .query("notifications")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .collect()
        .then((n) => n.length),

      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.eq(q.field("status"), "scheduled"))
        .collect()
        .then((b) => b.length),
    ])

    return {
      totalBookings,
      totalClients,
      totalNotifications,
      activeBookings,
      timestamp: Date.now(),
    }
  },
})
