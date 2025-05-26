import { query } from "./_generated/server"
import { v } from "convex/values"

// Export clients data
export const exportClients = query({
  args: {
    tenantId: v.id("tenants"),
    format: v.union(v.literal("csv"), v.literal("json")),
  },
  handler: async (ctx, args) => {
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect()

    // Get booking stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const bookings = await ctx.db
          .query("bookings")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
          .collect()

        const completedBookings = bookings.filter((b) => b.status === "completed")
        const totalSpent = completedBookings.length * 99.99 // Simplified calculation

        return {
          name: client.name,
          email: client.email || "",
          phone: client.phone || "",
          totalBookings: bookings.length,
          totalSpent,
          lastBooking: bookings[0]?.dateTime ? new Date(bookings[0].dateTime).toISOString() : "",
          createdAt: new Date(client.createdAt).toISOString(),
        }
      }),
    )

    if (args.format === "csv") {
      const headers = ["Name", "Email", "Phone", "Total Bookings", "Total Spent", "Last Booking", "Created At"]
      const rows = clientsWithStats.map((client) => [
        client.name,
        client.email,
        client.phone,
        client.totalBookings.toString(),
        client.totalSpent.toFixed(2),
        client.lastBooking,
        client.createdAt,
      ])

      return {
        headers,
        rows,
        format: "csv",
      }
    }

    return {
      data: clientsWithStats,
      format: "json",
    }
  },
})

// Export bookings data
export const exportBookings = query({
  args: {
    tenantId: v.id("tenants"),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      }),
    ),
    format: v.union(v.literal("csv"), v.literal("json")),
  },
  handler: async (ctx, args) => {
    let bookingsQuery = ctx.db.query("bookings").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    if (args.dateRange) {
      bookingsQuery = bookingsQuery.filter((q) =>
        q.and(q.gte(q.field("dateTime"), args.dateRange!.start), q.lte(q.field("dateTime"), args.dateRange!.end)),
      )
    }

    const bookings = await bookingsQuery.collect()

    // Get client names
    const clientIds = [...new Set(bookings.map((b) => b.clientId))]
    const clientsMap = new Map()

    for (const clientId of clientIds) {
      const client = await ctx.db.get(clientId)
      if (client) {
        clientsMap.set(clientId, client.name)
      }
    }

    const bookingsWithDetails = bookings.map((booking) => ({
      date: new Date(booking.dateTime).toISOString(),
      clientName: clientsMap.get(booking.clientId) || "Unknown",
      service: booking.service,
      status: booking.status,
      notes: booking.notes || "",
      createdAt: new Date(booking.createdAt).toISOString(),
    }))

    if (args.format === "csv") {
      const headers = ["Date", "Client", "Service", "Status", "Notes", "Created At"]
      const rows = bookingsWithDetails.map((booking) => [
        booking.date,
        booking.clientName,
        booking.service,
        booking.status,
        booking.notes,
        booking.createdAt,
      ])

      return {
        headers,
        rows,
        format: "csv",
      }
    }

    return {
      data: bookingsWithDetails,
      format: "json",
    }
  },
})
