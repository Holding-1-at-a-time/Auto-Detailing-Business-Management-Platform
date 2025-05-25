import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getBookings = query({
  args: {
    tenantId: v.id("tenants"),
    upcoming: v.optional(v.boolean()),
    clientId: v.optional(v.id("clients")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let bookingsQuery = ctx.db.query("bookings").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    // Filter by client if provided
    if (args.clientId) {
      bookingsQuery = ctx.db
        .query("bookings")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
    }

    // Filter by status if provided
    if (args.status) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    // Filter for upcoming bookings if requested
    if (args.upcoming) {
      const now = Date.now()
      bookingsQuery = bookingsQuery
        .filter((q) => q.gt(q.field("dateTime"), now))
        .filter((q) => q.eq(q.field("status"), "scheduled"))
    }

    // Apply limit if provided
    if (args.limit) {
      bookingsQuery = bookingsQuery.take(args.limit)
    }

    // Get the bookings
    const bookings = await bookingsQuery.collect()

    // Fetch client details for each booking
    const clientIds = [...new Set(bookings.map((booking) => booking.clientId))]
    const clients = await Promise.all(clientIds.map((clientId) => ctx.db.get(clientId)))

    const clientMap = new Map()
    clients.forEach((client) => {
      if (client) {
        clientMap.set(client._id, client)
      }
    })

    // Enrich bookings with client data
    return bookings.map((booking) => ({
      ...booking,
      client: clientMap.get(booking.clientId) || null,
    }))
  },
})

export const getBookingById = query({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)

    if (!booking) {
      return null
    }

    // Ensure booking belongs to the specified tenant
    if (booking.tenantId !== args.tenantId) {
      return null
    }

    // Get client details
    const client = await ctx.db.get(booking.clientId)

    return {
      ...booking,
      client,
    }
  },
})

export const createBooking = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    dateTime: v.number(),
    service: v.string(),
    notes: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Validate client exists and belongs to tenant
    const client = await ctx.db.get(args.clientId)
    if (!client || client.tenantId !== args.tenantId) {
      throw new Error("Client not found or does not belong to this tenant")
    }

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      clientId: args.clientId,
      dateTime: args.dateTime,
      service: args.service,
      status: "scheduled",
      notes: args.notes,
      googleEventId: args.googleEventId,
      createdAt: now,
      updatedAt: now,
    })

    return bookingId
  },
})

export const updateBooking = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    clientId: v.optional(v.id("clients")),
    dateTime: v.optional(v.number()),
    service: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Ensure booking belongs to the specified tenant
    if (booking.tenantId !== args.tenantId) {
      throw new Error("Booking does not belong to this tenant")
    }

    // If updating client, validate client exists and belongs to tenant
    if (args.clientId) {
      const client = await ctx.db.get(args.clientId)
      if (!client || client.tenantId !== args.tenantId) {
        throw new Error("Client not found or does not belong to this tenant")
      }
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.clientId !== undefined) updates.clientId = args.clientId
    if (args.dateTime !== undefined) updates.dateTime = args.dateTime
    if (args.service !== undefined) updates.service = args.service
    if (args.status !== undefined) updates.status = args.status
    if (args.notes !== undefined) updates.notes = args.notes
    if (args.googleEventId !== undefined) updates.googleEventId = args.googleEventId

    await ctx.db.patch(args.bookingId, updates)

    return args.bookingId
  },
})

export const deleteBooking = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Ensure booking belongs to the specified tenant
    if (booking.tenantId !== args.tenantId) {
      throw new Error("Booking does not belong to this tenant")
    }

    // Mark booking as cancelled
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      updatedAt: Date.now(),
    })

    return args.bookingId
  },
})
