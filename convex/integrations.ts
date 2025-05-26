import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getGoogleCalendarStatus = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "google_calendar"))
      .first()

    return {
      connected: integration?.enabled || false,
      settings: integration?.settings || {},
    }
  },
})

export const getEmailSettings = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "email_notifications"))
      .first()

    return {
      enabled: integration?.enabled || false,
      settings: integration?.settings || {},
    }
  },
})

export const getSmsSettings = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "sms_notifications"))
      .first()

    return {
      enabled: integration?.enabled || false,
      settings: integration?.settings || {},
    }
  },
})

export const disconnectGoogleCalendar = mutation({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "google_calendar"))
      .first()

    if (integration) {
      await ctx.db.patch(integration._id, {
        enabled: false,
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const updateEmailSettings = mutation({
  args: {
    tenantId: v.id("tenants"),
    enabled: v.boolean(),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "email_notifications"))
      .first()

    if (integration) {
      await ctx.db.patch(integration._id, {
        enabled: args.enabled,
        settings: args.settings || integration.settings,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("integrations", {
        tenantId: args.tenantId,
        type: "email_notifications",
        enabled: args.enabled,
        settings: args.settings || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const updateSmsSettings = mutation({
  args: {
    tenantId: v.id("tenants"),
    enabled: v.boolean(),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "sms_notifications"))
      .first()

    if (integration) {
      await ctx.db.patch(integration._id, {
        enabled: args.enabled,
        settings: args.settings || integration.settings,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("integrations", {
        tenantId: args.tenantId,
        type: "sms_notifications",
        enabled: args.enabled,
        settings: args.settings || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const connectGoogleCalendar = mutation({
  args: {
    tenantId: v.id("tenants"),
    accessToken: v.string(),
    refreshToken: v.string(),
    calendarId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_tenant_type", (q) => q.eq("tenantId", args.tenantId).eq("type", "google_calendar"))
      .first()

    const settings = {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      calendarId: args.calendarId || "primary",
    }

    if (integration) {
      await ctx.db.patch(integration._id, {
        enabled: true,
        settings,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("integrations", {
        tenantId: args.tenantId,
        type: "google_calendar",
        enabled: true,
        settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})
