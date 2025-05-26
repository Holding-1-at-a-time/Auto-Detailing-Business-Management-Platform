import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

// Audit log entry schema
const auditLogSchema = v.object({
  tenantId: v.id("tenants"),
  userId: v.string(),
  action: v.string(),
  resourceType: v.string(),
  resourceId: v.string(),
  changes: v.optional(v.any()),
  metadata: v.optional(v.any()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
})

// Create an audit log entry
export const createAuditLog = mutation({
  args: auditLogSchema,
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("auditLogs", {
      ...args,
      timestamp: Date.now(),
    })
    return logId
  },
})

// Query audit logs with filters
export const getAuditLogs = query({
  args: {
    tenantId: v.id("tenants"),
    filters: v.optional(
      v.object({
        userId: v.optional(v.string()),
        action: v.optional(v.string()),
        resourceType: v.optional(v.string()),
        resourceId: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
      }),
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    let query = ctx.db
      .query("auditLogs")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")

    // Apply filters
    if (args.filters) {
      if (args.filters.userId) {
        query = query.filter((q) => q.eq(q.field("userId"), args.filters!.userId))
      }
      if (args.filters.action) {
        query = query.filter((q) => q.eq(q.field("action"), args.filters!.action))
      }
      if (args.filters.resourceType) {
        query = query.filter((q) => q.eq(q.field("resourceType"), args.filters!.resourceType))
      }
      if (args.filters.resourceId) {
        query = query.filter((q) => q.eq(q.field("resourceId"), args.filters!.resourceId))
      }
      if (args.filters.startDate) {
        query = query.filter((q) => q.gte(q.field("timestamp"), args.filters!.startDate!))
      }
      if (args.filters.endDate) {
        query = query.filter((q) => q.lte(q.field("timestamp"), args.filters!.endDate!))
      }
    }

    // Apply cursor pagination
    if (args.cursor) {
      const cursorLog = await ctx.db.get(args.cursor as any)
      if (cursorLog) {
        query = query.filter((q) => q.lt(q.field("_creationTime"), cursorLog._creationTime))
      }
    }

    const logs = await query.take(limit + 1)
    const hasMore = logs.length > limit
    const results = hasMore ? logs.slice(0, limit) : logs
    const nextCursor = hasMore ? results[results.length - 1]._id : null

    return {
      logs: results,
      nextCursor,
      hasMore,
    }
  },
})

// Helper mutation to log common actions
export const logAction = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("view"),
      v.literal("export"),
      v.literal("import"),
      v.literal("login"),
      v.literal("logout"),
    ),
    resourceType: v.union(
      v.literal("booking"),
      v.literal("client"),
      v.literal("service"),
      v.literal("tenant"),
      v.literal("user"),
    ),
    resourceId: v.string(),
    changes: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(internal.auditLog.createAuditLog, {
      ...args,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  },
})
