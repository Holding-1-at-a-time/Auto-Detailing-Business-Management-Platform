import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Get available time slots for a specific date
export const getAvailableTimeSlots = query({
  args: {
    tenantId: v.id("tenants"),
    date: v.string(),
    service: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Parse the date string
    const dateObj = new Date(args.date)
    const startOfDay = new Date(dateObj)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateObj)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all bookings for this date
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant_and_dateTime", (q) =>
        q.eq("tenantId", args.tenantId).gte("dateTime", startOfDay.getTime()).lte("dateTime", endOfDay.getTime()),
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect()

    // Define business hours (9 AM to 5 PM)
    const businessHours = {
      start: 9, // 9 AM
      end: 17, // 5 PM
    }

    // Calculate service duration based on service type
    let serviceDuration = 60 // Default 1 hour in minutes
    if (args.service === "Full Detailing" || args.service === "Ceramic Coating") {
      serviceDuration = 120 // 2 hours
    } else if (args.service === "Paint Correction") {
      serviceDuration = 180 // 3 hours
    } else if (args.service === "Basic Wash") {
      serviceDuration = 30 // 30 minutes
    }

    // Generate all possible time slots
    const timeSlots = []
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Only add slots that can fit the service before closing time
        const slotEndHour = hour + Math.floor((minute + serviceDuration) / 60)
        const slotEndMinute = (minute + serviceDuration) % 60

        if (slotEndHour < businessHours.end || (slotEndHour === businessHours.end && slotEndMinute === 0)) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          timeSlots.push({
            time: timeString,
            available: true,
          })
        }
      }
    }

    // Mark booked slots as unavailable
    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.dateTime)
      const bookingHour = bookingDate.getHours()
      const bookingMinute = bookingDate.getMinutes()

      // Get booking service duration
      let bookingDuration = 60 // Default
      if (booking.service === "Full Detailing" || booking.service === "Ceramic Coating") {
        bookingDuration = 120
      } else if (booking.service === "Paint Correction") {
        bookingDuration = 180
      } else if (booking.service === "Basic Wash") {
        bookingDuration = 30
      }

      // Mark overlapping slots as unavailable
      timeSlots.forEach((slot, index) => {
        const [slotHour, slotMinute] = slot.time.split(":").map(Number)

        // Calculate slot end time
        const slotEndHour = slotHour + Math.floor((slotMinute + serviceDuration) / 60)
        const slotEndMinute = (slotMinute + serviceDuration) % 60

        // Calculate booking end time
        const bookingEndHour = bookingHour + Math.floor((bookingMinute + bookingDuration) / 60)
        const bookingEndMinute = (bookingMinute + bookingDuration) % 60

        // Check for overlap
        const slotStart = slotHour * 60 + slotMinute
        const slotEnd = slotEndHour * 60 + slotEndMinute
        const bookingStart = bookingHour * 60 + bookingMinute
        const bookingEnd = bookingEndHour * 60 + bookingEndMinute

        if (
          (slotStart >= bookingStart && slotStart < bookingEnd) || // Slot starts during booking
          (slotEnd > bookingStart && slotEnd <= bookingEnd) || // Slot ends during booking
          (slotStart <= bookingStart && slotEnd >= bookingEnd) // Slot contains booking
        ) {
          timeSlots[index].available = false
        }
      })
    })

    return timeSlots
  },
})

// Find client by search term (name, email, or phone)
export const findClientBySearch = query({
  args: {
    tenantId: v.id("tenants"),
    search: v.string(),
  },
  handler: async (ctx, args) => {
    const searchLower = args.search.toLowerCase()

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.or(
            q.contains(q.lower(q.field("name")), searchLower),
            q.contains(q.lower(q.field("email") || ""), searchLower),
            q.contains(q.lower(q.field("phone") || ""), searchLower),
          ),
        ),
      )
      .take(10)
      .collect()

    return clients.map((client) => ({
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    }))
  },
})

// Get booking by ID
export const getBookingById = query({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)

    if (!booking || booking.tenantId !== args.tenantId) {
      return null
    }

    // Get client information
    const client = await ctx.db.get(booking.clientId)

    return {
      ...booking,
      clientName: client?.name || "Unknown Client",
    }
  },
})

// Get past bookings
export const getPastBookings = query({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.optional(v.id("clients")),
    service: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("bookings").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    // Apply filters
    if (args.clientId) {
      query = query.filter((q) => q.eq(q.field("clientId"), args.clientId))
    }

    if (args.service) {
      query = query.filter((q) => q.eq(q.field("service"), args.service))
    }

    // Get bookings
    const bookings = await query.order("desc").take(args.limit).collect()

    // Get client information for each booking
    const clientIds = [...new Set(bookings.map((booking) => booking.clientId))]
    const clients = await Promise.all(clientIds.map((clientId) => ctx.db.get(clientId)))

    // Create a map of client IDs to names
    const clientMap = new Map()
    clients.forEach((client) => {
      if (client) {
        clientMap.set(client._id, client.name)
      }
    })

    // Format bookings with client names
    return bookings.map((booking) => ({
      id: booking._id,
      clientName: clientMap.get(booking.clientId) || "Unknown Client",
      service: booking.service,
      dateTime: booking.dateTime.toString(),
      status: booking.status,
      notes: booking.notes,
    }))
  },
})

// Get service details
export const getServiceDetails = query({
  args: {
    tenantId: v.id("tenants"),
    service: v.string(),
  },
  handler: async (ctx, args) => {
    // This would typically come from a services table
    // For now, we'll use a static mapping
    const serviceMap = {
      "Basic Wash": {
        name: "Basic Wash",
        description: "Exterior wash, tire cleaning, and basic interior vacuum.",
        duration: 30, // minutes
        price: 29.99,
      },
      "Interior Detailing": {
        name: "Interior Detailing",
        description: "Deep cleaning of all interior surfaces, carpet shampooing, and leather conditioning.",
        duration: 60,
        price: 89.99,
      },
      "Exterior Detailing": {
        name: "Exterior Detailing",
        description: "Thorough exterior cleaning, clay bar treatment, and wax application.",
        duration: 60,
        price: 99.99,
      },
      "Full Detailing": {
        name: "Full Detailing",
        description: "Complete interior and exterior detailing package.",
        duration: 120,
        price: 179.99,
      },
      "Ceramic Coating": {
        name: "Ceramic Coating",
        description: "Professional ceramic coating application for long-lasting protection.",
        duration: 120,
        price: 299.99,
      },
      "Paint Correction": {
        name: "Paint Correction",
        description: "Professional paint correction to remove scratches, swirls, and imperfections.",
        duration: 180,
        price: 349.99,
      },
    }

    return (
      serviceMap[args.service] || {
        name: args.service,
        description: "Custom service",
        duration: 60,
        price: 99.99,
      }
    )
  },
})

// Create a booking (internal mutation for agent use)
export const createBookingInternal = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    dateTime: v.number(),
    service: v.string(),
    notes: v.optional(v.string()),
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
      notes: args.notes || "",
      createdAt: now,
      updatedAt: now,
    })

    // Send notification about the new booking
    await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "booking_created",
      resourceId: bookingId,
      message: `New booking created for ${args.service} on ${new Date(args.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return bookingId
  },
})

// Update a booking (internal mutation for agent use)
export const updateBookingInternal = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    dateTime: v.optional(v.number()),
    service: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate booking exists and belongs to tenant
    const booking = await ctx.db.get(args.bookingId)
    if (!booking || booking.tenantId !== args.tenantId) {
      throw new Error("Booking not found or does not belong to this tenant")
    }

    // Prepare updates
    const updates: any = {
      updatedAt: now,
    }

    if (args.dateTime !== undefined) updates.dateTime = args.dateTime
    if (args.service !== undefined) updates.service = args.service
    if (args.status !== undefined) updates.status = args.status
    if (args.notes !== undefined) updates.notes = args.notes

    // Update the booking
    await ctx.db.patch(args.bookingId, updates)

    // Send notification about the updated booking
    await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "booking_updated",
      resourceId: args.bookingId,
      message: `Booking updated: ${booking.service} on ${new Date(booking.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return args.bookingId
  },
})

// Cancel a booking (internal mutation for agent use)
export const cancelBookingInternal = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate booking exists and belongs to tenant
    const booking = await ctx.db.get(args.bookingId)
    if (!booking || booking.tenantId !== args.tenantId) {
      throw new Error("Booking not found or does not belong to this tenant")
    }

    // Update the booking status
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      notes: args.reason ? `${booking.notes || ""}\nCancellation reason: ${args.reason}` : booking.notes,
      updatedAt: now,
    })

    // Send notification about the cancelled booking
    await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "booking_cancelled",
      resourceId: args.bookingId,
      message: `Booking cancelled: ${booking.service} on ${new Date(booking.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return args.bookingId
  },
})

// Create a client (internal mutation for agent use)
export const createClientInternal = mutation({
  args: {
    tenantId: v.id("tenants"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Create the client
    const clientId = await ctx.db.insert("clients", {
      tenantId: args.tenantId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    })

    return clientId
  },
})
