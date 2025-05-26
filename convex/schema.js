import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Define the schema with tables for the application
const schema = defineSchema({
  // Bookings table
  bookings: defineTable({
    tenantId: v.string(),
    clientId: v.string(),
    serviceId: v.string(),
    status: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    notes: v.optional(v.string()),
    vehicleInfo: v.optional(
      v.object({
        make: v.string(),
        model: v.string(),
        year: v.string(),
        color: v.optional(v.string()),
        licensePlate: v.optional(v.string()),
      }),
    ),
    price: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.string(),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_client", ["tenantId", "clientId"])
    .index("by_status", ["tenantId", "status"])
    .index("by_date", ["tenantId", "startTime"]),

  // Clients table
  clients: defineTable({
    tenantId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_email", ["tenantId", "email"])
    .index("by_name", ["tenantId", "name"]),

  // Tenants table
  tenants: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    plan: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    settings: v.optional(
      v.object({
        timezone: v.optional(v.string()),
        businessHours: v.optional(
          v.array(
            v.object({
              day: v.number(),
              start: v.string(),
              end: v.string(),
              isOpen: v.boolean(),
            }),
          ),
        ),
        logo: v.optional(v.string()),
        colors: v.optional(
          v.object({
            primary: v.optional(v.string()),
            secondary: v.optional(v.string()),
          }),
        ),
      }),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  // Users table
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    tenantId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_tenant", ["tenantId"]),

  // Services table
  services: defineTable({
    tenantId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    duration: v.number(), // in minutes
    price: v.number(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_active", ["tenantId", "isActive"]),

  // Notifications table
  notifications: defineTable({
    tenantId: v.string(),
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(), // info, success, warning, error
    isRead: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant_user", ["tenantId", "userId"])
    .index("by_unread", ["userId", "isRead"]),
})

export default schema
