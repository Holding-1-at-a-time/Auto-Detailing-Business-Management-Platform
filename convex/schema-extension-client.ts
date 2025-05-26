import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  clientThreads: defineTable({
    tenantId: v.id("tenants"),
    status: v.string(), // active, completed, cancelled
    bookingId: v.optional(v.id("bookings")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_status", ["tenantId", "status"]),

  clientMessages: defineTable({
    threadId: v.id("clientThreads"),
    role: v.string(), // user, assistant, system
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_and_created", ["threadId", "createdAt"]),

  // Extend the bookings table schema
  bookings: defineTable({
    tenantId: v.id("tenants"),
    clientId: v.optional(v.id("clients")), // Optional for client-facing bookings
    clientName: v.optional(v.string()), // For client-facing bookings
    clientEmail: v.optional(v.string()), // For client-facing bookings
    clientPhone: v.optional(v.string()), // For client-facing bookings
    dateTime: v.number(),
    service: v.string(),
    status: v.string(), // scheduled, completed, cancelled
    notes: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
    isClientBooking: v.optional(v.boolean()), // Flag to identify client-facing bookings
    googleEventId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_client", ["clientId"])
    .index("by_tenant_and_dateTime", ["tenantId", "dateTime"])
    .index("by_tenant_and_status", ["tenantId", "status"])
    .index("by_tenant_and_client_booking", ["tenantId", "isClientBooking"]),
})
