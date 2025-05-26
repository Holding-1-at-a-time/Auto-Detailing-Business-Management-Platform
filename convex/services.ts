import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Define service schema
const serviceSchema = v.object({
  name: v.string(),
  description: v.string(),
  duration: v.number(), // in minutes
  price: v.number(),
  category: v.string(),
  isActive: v.boolean(),
})

// Get all services for a tenant
export const getServices = query({
  args: {
    tenantId: v.id("tenants"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let servicesQuery = ctx.db.query("services").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    if (!args.includeInactive) {
      servicesQuery = servicesQuery.filter((q) => q.eq(q.field("isActive"), true))
    }

    return await servicesQuery.collect()
  },
})

// Get a single service
export const getService = query({
  args: {
    tenantId: v.id("tenants"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)

    if (!service || service.tenantId !== args.tenantId) {
      return null
    }

    return service
  },
})

// Create a new service
export const createService = mutation({
  args: {
    tenantId: v.id("tenants"),
    ...serviceSchema.fields,
  },
  handler: async (ctx, args) => {
    const { tenantId, ...serviceData } = args

    // Check if service name already exists
    const existing = await ctx.db
      .query("services")
      .withIndex("by_tenant_and_name", (q) => q.eq("tenantId", tenantId).eq("name", serviceData.name))
      .first()

    if (existing) {
      throw new Error("Service with this name already exists")
    }

    const serviceId = await ctx.db.insert("services", {
      tenantId,
      ...serviceData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return serviceId
  },
})

// Update a service
export const updateService = mutation({
  args: {
    tenantId: v.id("tenants"),
    serviceId: v.id("services"),
    ...Object.fromEntries(Object.entries(serviceSchema.fields).map(([key, value]) => [key, v.optional(value)])),
  },
  handler: async (ctx, args) => {
    const { tenantId, serviceId, ...updates } = args

    const service = await ctx.db.get(serviceId)
    if (!service || service.tenantId !== tenantId) {
      throw new Error("Service not found")
    }

    // Check if updating name to an existing one
    if (updates.name && updates.name !== service.name) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_tenant_and_name", (q) => q.eq("tenantId", tenantId).eq("name", updates.name))
        .first()

      if (existing) {
        throw new Error("Service with this name already exists")
      }
    }

    await ctx.db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return serviceId
  },
})

// Delete (deactivate) a service
export const deleteService = mutation({
  args: {
    tenantId: v.id("tenants"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service || service.tenantId !== args.tenantId) {
      throw new Error("Service not found")
    }

    // Check if service is used in any bookings
    const bookingsWithService = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("service"), service.name))
      .take(1)

    if (bookingsWithService.length > 0) {
      // Soft delete - just deactivate
      await ctx.db.patch(args.serviceId, {
        isActive: false,
        updatedAt: Date.now(),
      })
    } else {
      // Hard delete - no bookings reference this service
      await ctx.db.delete(args.serviceId)
    }

    return { success: true }
  },
})

// Get service statistics
export const getServiceStatistics = query({
  args: {
    tenantId: v.id("tenants"),
    serviceId: v.id("services"),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service || service.tenantId !== args.tenantId) {
      throw new Error("Service not found")
    }

    const now = Date.now()
    const dateRange = args.dateRange || {
      start: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      end: now,
    }

    // Get bookings for this service
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) =>
        q.and(
          q.eq(q.field("service"), service.name),
          q.gte(q.field("createdAt"), dateRange.start),
          q.lte(q.field("createdAt"), dateRange.end),
        ),
      )
      .collect()

    const completedBookings = bookings.filter((b) => b.status === "completed")
    const revenue = completedBookings.length * service.price

    // Get unique clients
    const uniqueClients = new Set(bookings.map((b) => b.clientId)).size

    // Calculate average bookings per day
    const daysDiff = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)
    const averagePerDay = bookings.length / daysDiff

    return {
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
      revenue,
      uniqueClients,
      averagePerDay,
      utilizationRate: Math.round((completedBookings.length / bookings.length) * 100) || 0,
    }
  },
})
