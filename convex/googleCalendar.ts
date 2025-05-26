import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const saveGoogleCalendarTokens = mutation({
  args: {
    tenantId: v.id("tenants"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if tokens already exist for this tenant
    const existingTokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    const now = Date.now()

    if (existingTokens) {
      // Update existing tokens
      await ctx.db.patch(existingTokens._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: now,
      })
      return existingTokens._id
    } else {
      // Create new tokens
      const tokenId = await ctx.db.insert("googleCalendarTokens", {
        tenantId: args.tenantId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: now,
      })

      // Update tenant settings to mark calendar as connected
      const settings = await ctx.db
        .query("tenantSettings")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
        .first()

      if (settings) {
        await ctx.db.patch(settings._id, {
          calendarConnected: true,
          updatedAt: now,
        })
      }

      return tokenId
    }
  },
})

export const getGoogleCalendarTokens = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    return tokens
  },
})

export const removeGoogleCalendarTokens = mutation({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (tokens) {
      await ctx.db.delete(tokens._id)
    }

    // Update tenant settings to mark calendar as disconnected
    const settings = await ctx.db
      .query("tenantSettings")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (settings) {
      await ctx.db.patch(settings._id, {
        calendarConnected: false,
        googleCalendarId: undefined,
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const updateGoogleCalendarTokens = mutation({
  args: {
    tenantId: v.id("tenants"),
    accessToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (!tokens) {
      throw new Error("Google Calendar tokens not found for this tenant")
    }

    await ctx.db.patch(tokens._id, {
      accessToken: args.accessToken,
      expiryDate: args.expiryDate,
      updatedAt: Date.now(),
    })

    return tokens._id
  },
})
