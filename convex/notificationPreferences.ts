import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

// Notification preference schema
const preferenceSchema = v.object({
  email: v.object({
    bookingConfirmation: v.boolean(),
    bookingReminder: v.boolean(),
    bookingCancellation: v.boolean(),
    dailySummary: v.boolean(),
    weeklyReport: v.boolean(),
  }),
  sms: v.object({
    bookingConfirmation: v.boolean(),
    bookingReminder: v.boolean(),
    bookingCancellation: v.boolean(),
  }),
  push: v.object({
    bookingConfirmation: v.boolean(),
    bookingReminder: v.boolean(),
    bookingCancellation: v.boolean(),
    instantNotifications: v.boolean(),
  }),
})

// Get notification preferences
export const getPreferences = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_tenant_and_user", (q) => q.eq("tenantId", args.tenantId).eq("userId", args.userId))
      .first()

    // Return default preferences if none exist
    if (!preferences) {
      return {
        email: {
          bookingConfirmation: true,
          bookingReminder: true,
          bookingCancellation: true,
          dailySummary: false,
          weeklyReport: true,
        },
        sms: {
          bookingConfirmation: true,
          bookingReminder: true,
          bookingCancellation: true,
        },
        push: {
          bookingConfirmation: true,
          bookingReminder: true,
          bookingCancellation: true,
          instantNotifications: true,
        },
      }
    }

    return preferences
  },
})

// Update notification preferences
export const updatePreferences = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    preferences: preferenceSchema,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_tenant_and_user", (q) => q.eq("tenantId", args.tenantId).eq("userId", args.userId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.preferences,
        updatedAt: Date.now(),
      })
      return existing._id
    } else {
      const id = await ctx.db.insert("notificationPreferences", {
        tenantId: args.tenantId,
        userId: args.userId,
        ...args.preferences,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      return id
    }
  },
})

// Check if user should receive a specific notification
export const shouldNotify = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    notificationType: v.string(),
    channel: v.union(v.literal("email"), v.literal("sms"), v.literal("push")),
  },
  handler: async (ctx, args) => {
    const preferences = await ctx.runQuery(internal.notificationPreferences.getPreferences, {
      tenantId: args.tenantId,
      userId: args.userId,
    })

    const channelPrefs = preferences[args.channel]
    return channelPrefs[args.notificationType as keyof typeof channelPrefs] || false
  },
})
