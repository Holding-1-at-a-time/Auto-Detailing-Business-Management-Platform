/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 25/05/2025 - 21:42:09
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Define additional tables for our booking agent
  notificationsTable: defineTable({
    tenantId: v.id("tenants"),
    type: v.string(), // e.g., "booking_created", "booking_confirmation", "workflow_error"
    resourceId: v.string(), // ID of the related resource (booking, client, etc.)
    message: v.string(),
    isRead: v.boolean(),
    updatedAt: v.optional(v.number()),
    })
    .index("by_tenant", ["tenantId"]),

  agentThreadsTable: defineTable({
    threadId: v.string(),
    tenantId: v.id("tenants"),
    userId: v.string(),
    title: v.string(),
    summary: v.optional(v.string()),
    status: v.string(), // "active", "completed", "failed", "canceled"
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_threadId", ["threadId"])
    .index("by_tenant_and_user", ["tenantId", "userId"]),

  tokenUsageTable: defineTable({
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    userId: v.string(),
    tenantId: v.id("tenants"),
    threadId: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_thread", ["threadId"]),
})
