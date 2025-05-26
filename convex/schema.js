import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Define the schema with all tables and their fields
const schema = defineSchema({
  // Tenants table - represents businesses using the platform
  tenants: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    settings: v.optional(
      v.object({
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
        serviceSettings: v.optional(
          v.object({
            defaultDuration: v.optional(v.number()),
            bufferTime: v.optional(v.number()),
          }),
        ),
        notificationSettings: v.optional(
          v.object({
            emailEnabled: v.optional(v.boolean()),
            smsEnabled: v.optional(v.boolean()),
            reminderHours: v.optional(v.number()),
          }),
        ),
      }),
    ),
    plan: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  // Users table - represents users of the platform
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    tenantId: v.id("tenants"),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(
          v.object({
            email: v.optional(v.boolean()),
            push: v.optional(v.boolean()),
          }),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_tenant", ["tenantId"]),

  // Clients table - represents customers of the business
  clients: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    vehicles: v.optional(
      v.array(
        v.object({
          make: v.string(),
          model: v.string(),
          year: v.number(),
          color: v.optional(v.string()),
          licensePlate: v.optional(v.string()),
        }),
      ),
    ),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_email", ["tenantId", "email"])
    .index("by_phone", ["tenantId", "phone"]),

  // Services table - represents services offered by the business
  services: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    durationMinutes: v.number(),
    category: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_category", ["tenantId", "category"]),

  // Bookings table - represents appointments
  bookings: defineTable({
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    startTime: v.number(),
    endTime: v.number(),
    status: v.string(), // scheduled, completed, cancelled, no-show
    notes: v.optional(v.string()),
    vehicle: v.optional(
      v.object({
        make: v.string(),
        model: v.string(),
        year: v.number(),
        color: v.optional(v.string()),
        licensePlate: v.optional(v.string()),
      }),
    ),
    price: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_client", ["tenantId", "clientId"])
    .index("by_service", ["tenantId", "serviceId"])
    .index("by_status", ["tenantId", "status"])
    .index("by_time", ["tenantId", "startTime"]),

  // Notifications table - for system notifications
  notifications: defineTable({
    tenantId: v.id("tenants"),
    userId: v.optional(v.string()),
    type: v.string(), // email, sms, in-app
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    resourceType: v.optional(v.string()), // booking, client, etc.
    resourceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["tenantId", "userId"])
    .index("by_read", ["tenantId", "userId", "read"]),

  // Integrations table - for third-party integrations
  integrations: defineTable({
    tenantId: v.id("tenants"),
    type: v.string(), // google-calendar, stripe, etc.
    config: v.object({}),
    status: v.string(), // active, inactive, error
    lastSyncTime: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_type", ["tenantId", "type"]),

  // Audit logs table - for tracking system activity
  auditLogs: defineTable({
    tenantId: v.id("tenants"),
    userId: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    details: v.object({}),
    timestamp: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["tenantId", "userId"])
    .index("by_resource", ["tenantId", "resourceType", "resourceId"]),

  // Agent threads table - for AI booking agent conversations
  agentThreads: defineTable({
    threadId: v.string(),
    tenantId: v.id("tenants"),
    userId: v.string(),
    title: v.string(),
    status: v.string(), // active, completed, archived
    summary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_threadId", ["threadId"])
    .index("by_user", ["tenantId", "userId"]),

  // Token usage table - for tracking AI token usage
  tokenUsage: defineTable({
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    userId: v.string(),
    threadId: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_thread", ["threadId"])
    .index("by_model", ["model"]),

  // System health metrics
  systemHealth: defineTable({
    tenantId: v.optional(v.id("tenants")),
    component: v.string(),
    status: v.string(), // healthy, degraded, down
    message: v.optional(v.string()),
    lastChecked: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_component", ["component"]),

  // Client notes table
  clientNotes: defineTable({
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    note: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_client", ["tenantId", "clientId"]),

  // Analytics events
  analyticsEvents: defineTable({
    tenantId: v.id("tenants"),
    eventType: v.string(),
    eventData: v.object({}),
    userId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_event_type", ["tenantId", "eventType"]),
})

export default schema
