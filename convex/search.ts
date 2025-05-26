import { query } from "./_generated/server"
import { v } from "convex/values"

// Global search across multiple resources
export const globalSearch = query({
  args: {
    tenantId: v.id("tenants"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase()
    const limit = args.limit || 10

    // Parallel search across resources
    const [clients, bookings] = await Promise.all([
      // Search clients
      ctx.db
        .query("clients")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) =>
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.or(
              q.contains(q.lower(q.field("name")), searchQuery),
              q.contains(q.lower(q.field("email") || ""), searchQuery),
              q.contains(q.lower(q.field("phone") || ""), searchQuery),
            ),
          ),
        )
        .take(limit),

      // Search bookings by service
      ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.contains(q.lower(q.field("service")), searchQuery))
        .take(limit),
    ])

    // Get client names for bookings
    const clientIds = [...new Set(bookings.map((b) => b.clientId))]
    const clientsMap = new Map()

    for (const clientId of clientIds) {
      const client = await ctx.db.get(clientId)
      if (client) {
        clientsMap.set(clientId, client.name)
      }
    }

    // Format results
    const results = [
      ...clients.map((client) => ({
        type: "client" as const,
        id: client._id,
        title: client.name,
        subtitle: client.email || client.phone || "No contact info",
        url: `/clients/${client._id}`,
      })),
      ...bookings.map((booking) => ({
        type: "booking" as const,
        id: booking._id,
        title: `${booking.service} - ${clientsMap.get(booking.clientId) || "Unknown"}`,
        subtitle: new Date(booking.dateTime).toLocaleString(),
        url: `/bookings/${booking._id}`,
      })),
    ]

    return results.slice(0, limit)
  },
})

// Autocomplete for client search
export const clientAutocomplete = query({
  args: {
    tenantId: v.id("tenants"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.query.length < 2) return []

    const searchQuery = args.query.toLowerCase()
    const limit = args.limit || 5

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.or(
            q.contains(q.lower(q.field("name")), searchQuery),
            q.contains(q.lower(q.field("email") || ""), searchQuery),
            q.contains(q.lower(q.field("phone") || ""), searchQuery),
          ),
        ),
      )
      .take(limit)

    return clients.map((client) => ({
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    }))
  },
})
