import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getTenant = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tenantId)
  },
})

export const getTenantByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect()

    return tenants[0] || null
  },
})

export const createTenant = mutation({
  args: {
    name: v.string(),
    timezone: v.string(),
    logoUrl: v.optional(v.string()),
    userId: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if tenant already exists
    const existingTenants = await ctx.db
      .query("tenants")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect()

    if (existingTenants.length > 0) {
      throw new Error(`Tenant with name "${args.name}" already exists`)
    }

    const now = Date.now()

    // Create the tenant
    const tenantId = await ctx.db.insert("tenants", {
      name: args.name,
      timezone: args.timezone,
      logoUrl: args.logoUrl,
      createdAt: now,
      updatedAt: now,
    })

    // Create default tenant settings
    await ctx.db.insert("tenantSettings", {
      tenantId,
      businessName: args.name,
      timezone: args.timezone,
      calendarConnected: false,
      updatedAt: now,
    })

    // Check if user exists
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    if (existingUsers.length > 0) {
      // Update existing user to add this tenant
      const user = existingUsers[0]
      await ctx.db.patch(user._id, {
        tenants: [...user.tenants, tenantId],
        updatedAt: now,
      })
    } else {
      // Create new user with this tenant
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.userEmail,
        tenants: [tenantId],
        createdAt: now,
        updatedAt: now,
      })
    }

    return tenantId
  },
})

export const updateTenant = mutation({
  args: {
    tenantId: v.id("tenants"),
    name: v.optional(v.string()),
    timezone: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db.get(args.tenantId)

    if (!tenant) {
      throw new Error("Tenant not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.timezone !== undefined) updates.timezone = args.timezone
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl

    await ctx.db.patch(args.tenantId, updates)

    return args.tenantId
  },
})

export const getTenantSettings = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("tenantSettings")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    return settings
  },
})

export const updateTenantSettings = mutation({
  args: {
    tenantId: v.id("tenants"),
    businessName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    calendarConnected: v.optional(v.boolean()),
    googleCalendarId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("tenantSettings")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (!settings) {
      throw new Error("Tenant settings not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.businessName !== undefined) updates.businessName = args.businessName
    if (args.timezone !== undefined) updates.timezone = args.timezone
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl
    if (args.calendarConnected !== undefined) updates.calendarConnected = args.calendarConnected
    if (args.googleCalendarId !== undefined) updates.googleCalendarId = args.googleCalendarId

    await ctx.db.patch(settings._id, updates)

    return settings._id
  },
})
