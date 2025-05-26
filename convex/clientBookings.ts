import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"

// Get client booking by ID
export const getClientBookingById = query({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)

    if (!booking || booking.tenantId !== args.tenantId) {
      return null
    }

    return {
      id: booking._id,
      tenantId: booking.tenantId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      service: booking.service,
      dateTime: booking.dateTime,
      status: booking.status,
      notes: booking.notes,
      vehicleType: booking.vehicleType,
      createdAt: booking.createdAt,
    }
  },
})

// Create a client booking
export const createClientBooking = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    service: v.string(),
    dateTime: v.number(),
    notes: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      service: args.service,
      dateTime: args.dateTime,
      status: "scheduled",
      notes: args.notes || "",
      vehicleType: args.vehicleType || "",
      isClientBooking: true,
      createdAt: now,
      updatedAt: now,
    })

    // Send notification to tenant about the new booking
    await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "client_booking_created",
      resourceId: bookingId,
      message: `New client booking: ${args.clientName} booked ${args.service} on ${new Date(args.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return bookingId
  },
})

// Cancel a client booking
export const cancelClientBooking = mutation({
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
      type: "client_booking_cancelled",
      resourceId: args.bookingId,
      message: `Booking cancelled: ${booking.service} on ${new Date(booking.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return args.bookingId
  },
})

// Create a client thread for AI booking
export const createClientThread = mutation({
  args: {
    tenantId: v.id("tenants"),
    initialMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a thread for the client
    const threadId = await ctx.db.insert("clientThreads", {
      tenantId: args.tenantId,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Add the initial message to the thread
    await ctx.db.insert("clientMessages", {
      threadId,
      role: "user",
      content: args.initialMessage,
      createdAt: Date.now(),
    })

    // Process the message with the AI agent
    // This is a simplified version - in a real implementation, you would use the AI agent
    const response =
      "I'd be happy to help you book an appointment! Could you tell me what service you're interested in and when you'd like to schedule it?"

    // Add the assistant response to the thread
    await ctx.db.insert("clientMessages", {
      threadId,
      role: "assistant",
      content: response,
      createdAt: Date.now(),
    })

    // In a real implementation, you might create a booking here if the initial message contains enough information
    // For now, we'll just return the thread ID and response
    return {
      threadId,
      response,
      bookingId: null, // No booking created yet
    }
  },
})

// Continue a client thread for AI booking
export const continueClientThread = mutation({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.id("clientThreads"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate thread exists and belongs to tenant
    const thread = await ctx.db.get(args.threadId)
    if (!thread || thread.tenantId !== args.tenantId) {
      throw new Error("Thread not found or does not belong to this tenant")
    }

    // Add the user message to the thread
    await ctx.db.insert("clientMessages", {
      threadId: args.threadId,
      role: "user",
      content: args.message,
      createdAt: Date.now(),
    })

    // Process the message with the AI agent
    // This is a simplified version - in a real implementation, you would use the AI agent
    let response = ""
    let bookingId: Id<"bookings"> | null = null

    // Simple pattern matching to simulate AI understanding
    const message = args.message.toLowerCase()
    if (
      (message.includes("book") || message.includes("schedule") || message.includes("appointment")) &&
      (message.includes("tomorrow") || message.includes("next") || message.includes("on"))
    ) {
      // Extract service type (very simplified)
      let service = "Basic Wash" // Default
      if (message.includes("full") || message.includes("complete")) {
        service = "Full Detailing"
      } else if (message.includes("interior")) {
        service = "Interior Detailing"
      } else if (message.includes("exterior")) {
        service = "Exterior Detailing"
      } else if (message.includes("ceramic") || message.includes("coating")) {
        service = "Ceramic Coating"
      }

      // Create a booking (simplified)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0) // Default to 10 AM

      bookingId = await ctx.db.insert("bookings", {
        tenantId: args.tenantId,
        clientName: "AI Booking Client", // In a real implementation, you would extract this
        clientEmail: "client@example.com", // In a real implementation, you would extract this
        clientPhone: "555-123-4567", // In a real implementation, you would extract this
        service,
        dateTime: tomorrow.getTime(),
        status: "scheduled",
        notes: "Booked via AI assistant",
        vehicleType: "Not specified",
        isClientBooking: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      response = `Great! I've booked you for a ${service} tomorrow at 10:00 AM. Your booking is confirmed! You'll receive a confirmation email shortly.`
    } else {
      response =
        "I'd be happy to help you book an appointment. Could you please provide more details about what service you need and when you'd like to schedule it?"
    }

    // Add the assistant response to the thread
    await ctx.db.insert("clientMessages", {
      threadId: args.threadId,
      role: "assistant",
      content: response,
      createdAt: Date.now(),
    })

    return {
      response,
      bookingId,
    }
  },
})

// Create a client booking from agent
export const createClientBookingFromAgent = mutation({
  args: {
    tenantId: v.id("tenants"),
    threadId: v.id("clientThreads"),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    service: v.string(),
    dateTime: v.number(),
    notes: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Validate thread exists and belongs to tenant
    const thread = await ctx.db.get(args.threadId)
    if (!thread || thread.tenantId !== args.tenantId) {
      throw new Error("Thread not found or does not belong to this tenant")
    }

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      service: args.service,
      dateTime: args.dateTime,
      status: "scheduled",
      notes: args.notes || "",
      vehicleType: args.vehicleType || "",
      isClientBooking: true,
      createdAt: now,
      updatedAt: now,
    })

    // Update thread status
    await ctx.db.patch(args.threadId, {
      status: "completed",
      bookingId,
      updatedAt: now,
    })

    // Send notification to tenant about the new booking
    await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      type: "client_booking_created",
      resourceId: bookingId,
      message: `New client booking via AI: ${args.clientName} booked ${args.service} on ${new Date(args.dateTime).toLocaleString()}`,
      isRead: false,
      createdAt: now,
    })

    return bookingId
  },
})
