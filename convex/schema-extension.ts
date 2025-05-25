import { defineTable } from "convex/server"
import { v } from "convex/values"

// Define additional tables for our booking agent
export const notificationsTable = defineTable({
  tenantId: v.id("tenants"),
  type: v.string(), // e.g., "booking_created", "booking_confirmation", "workflow_error"
  resourceId: v.string(), // ID of the related resource (booking, client, etc.)
  message: v.string(),
  isRead: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
}).index("by_tenant", ["tenantId"])

export const agentThreadsTable = defineTable({
  tenantId: v.id("tenants"),
  userId: v.string(),
  title: v.string(),
  summary: v.optional(v.string()),
  status: v.string(), // "active", "completed", "failed"
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_tenant_and_user", ["tenantId", "userId"])
