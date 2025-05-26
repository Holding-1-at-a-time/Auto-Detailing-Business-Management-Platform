import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tenants: defineTable({
    name: v.string(),
    timezone: v.string(),
    stripeCustomerId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    tenants: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  tenantSettings: defineTable({
    tenantId: v.id("tenants"),
    businessName: v.string(),
    timezone: v.string(),
    logoUrl: v.optional(v.string()),
    calendarConnected: v.boolean(),
    googleCalendarId: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_tenantId", ["tenantId"]),

  clients: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_name", ["tenantId", "name"])
    .index("by_tenant_and_email", ["tenantId", "email"]),

  bookings: defineTable({
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    dateTime: v.number(), // Unix timestamp
    service: v.string(),
    status: v.string(), // "scheduled", "completed", "cancelled"
    notes: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_status", ["tenantId", "status"])
    .index("by_client", ["clientId"])
    .index("by_tenant_and_dateTime", ["tenantId", "dateTime"]),

  googleCalendarTokens: defineTable({
    tenantId: v.id("tenants"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
    updatedAt: v.number(),
  }).index("by_tenantId", ["tenantId"]),

  notifications: defineTable({
    tenantId: v.id("tenants"),
    type: v.string(),
    resourceId: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_read", ["tenantId", "isRead"]),
})
