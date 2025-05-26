import { mutation } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { internal } from "./_generated/api"

// Batch create clients
export const batchCreateClients = mutation({
  args: {
    tenantId: v.id("tenants"),
    clients: v.array(
      v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      created: [] as Id<"clients">[],
      errors: [] as { index: number; error: string }[],
    }

    const now = Date.now()

    for (let i = 0; i < args.clients.length; i++) {
      const client = args.clients[i]

      try {
        // Check for duplicate email if provided
        if (client.email) {
          const existing = await ctx.db
            .query("clients")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .filter((q) => q.and(q.eq(q.field("email"), client.email), q.eq(q.field("isDeleted"), false)))
            .first()

          if (existing) {
            results.errors.push({
              index: i,
              error: `Client with email ${client.email} already exists`,
            })
            continue
          }
        }

        const clientId = await ctx.db.insert("clients", {
          tenantId: args.tenantId,
          ...client,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        })

        results.created.push(clientId)
      } catch (error) {
        results.errors.push({
          index: i,
          error: `Failed to create client: ${error}`,
        })
      }
    }

    return results
  },
})

// Batch update booking status
export const batchUpdateBookingStatus = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingIds: v.array(v.id("bookings")),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const results = {
      updated: 0,
      errors: [] as string[],
    }

    const now = Date.now()

    for (const bookingId of args.bookingIds) {
      try {
        const booking = await ctx.db.get(bookingId)

        if (!booking) {
          results.errors.push(`Booking ${bookingId} not found`)
          continue
        }

        if (booking.tenantId !== args.tenantId) {
          results.errors.push(`Booking ${bookingId} does not belong to tenant`)
          continue
        }

        await ctx.db.patch(bookingId, {
          status: args.status,
          updatedAt: now,
        })

        results.updated++

        // Log the action
        await ctx.runMutation(internal.auditLog.logAction, {
          tenantId: args.tenantId,
          userId: "system", // Should be passed from context
          action: "update",
          resourceType: "booking",
          resourceId: bookingId,
          changes: { status: args.status },
        })
      } catch (error) {
        results.errors.push(`Failed to update booking ${bookingId}: ${error}`)
      }
    }

    return results
  },
})

// Batch delete old notifications
export const batchDeleteOldNotifications = mutation({
  args: {
    tenantId: v.id("tenants"),
    olderThan: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.and(q.eq(q.field("isRead"), true), q.lt(q.field("createdAt"), args.olderThan)))
      .collect()

    let deleted = 0
    for (const notification of notifications) {
      await ctx.db.delete(notification._id)
      deleted++
    }

    return { deleted }
  },
})
