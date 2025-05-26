import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getTenant = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tenantId)
  },
})

export const getTenantById = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      return null
    }
    return tenant
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

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Convert slug to tenant name (assuming slug is lowercase with hyphens)
    const name = args.slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_name", (q) => q.eq("name", name))
      .collect()

    return tenants[0] || null
  },
})

export const getUserTenants = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get user by userId
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    const user = users[0]
    if (!user) {
      return []
    }

    // Get all tenants for this user
    const tenants = await Promise.all(
      user.tenants.map(async (tenantId) => {
        const tenant = await ctx.db.get(tenantId as any)
        return tenant
      }),
    )

    return tenants.filter(Boolean)
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
    // Validate name
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Tenant name is required")
    }

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

    if (args.name !== undefined) {
      // Validate name
      if (args.name.trim().length === 0) {
        throw new Error("Tenant name cannot be empty")
      }

      // Check if another tenant has this name
      const existingTenants = await ctx.db
        .query("tenants")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .collect()

      if (existingTenants.length > 0 && existingTenants[0]._id !== args.tenantId) {
        throw new Error(`Another tenant with name "${args.name}" already exists`)
      }

      updates.name = args.name
    }

    if (args.timezone !== undefined) updates.timezone = args.timezone
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl

    await ctx.db.patch(args.tenantId, updates)

    // Update tenant settings if needed
    if (args.name !== undefined || args.timezone !== undefined) {
      const settings = await ctx.db
        .query("tenantSettings")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
        .first()

      if (settings) {
        const settingsUpdates: any = { updatedAt: Date.now() }
        if (args.name !== undefined) settingsUpdates.businessName = args.name
        if (args.timezone !== undefined) settingsUpdates.timezone = args.timezone

        await ctx.db.patch(settings._id, settingsUpdates)
      }
    }

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
      // Create settings if they don't exist
      const tenant = await ctx.db.get(args.tenantId)
      if (!tenant) {
        throw new Error("Tenant not found")
      }

      await ctx.db.insert("tenantSettings", {
        tenantId: args.tenantId,
        businessName: args.businessName || tenant.name,
        timezone: args.timezone || tenant.timezone,
        logoUrl: args.logoUrl,
        calendarConnected: args.calendarConnected || false,
        googleCalendarId: args.googleCalendarId,
        updatedAt: Date.now(),
      })

      return args.tenantId
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

export const deleteTenant = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Verify user has access to this tenant
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    const user = users[0]
    if (!user || !user.tenants.includes(args.tenantId)) {
      throw new Error("Unauthorized: User does not have access to this tenant")
    }

    // Delete all related data
    // 1. Delete bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    for (const booking of bookings) {
      await ctx.db.delete(booking._id)
    }

    // 2. Delete clients
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    for (const client of clients) {
      await ctx.db.delete(client._id)
    }

    // 3. Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    for (const notification of notifications) {
      await ctx.db.delete(notification._id)
    }

    // 4. Delete tenant settings
    const settings = await ctx.db
      .query("tenantSettings")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (settings) {
      await ctx.db.delete(settings._id)
    }

    // 5. Delete Google Calendar tokens
    const tokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (tokens) {
      await ctx.db.delete(tokens._id)
    }

    // 6. Remove tenant from user's tenant list
    const updatedTenants = user.tenants.filter((id) => id !== args.tenantId)
    await ctx.db.patch(user._id, {
      tenants: updatedTenants,
      updatedAt: Date.now(),
    })

    // 7. Finally, delete the tenant
    await ctx.db.delete(args.tenantId)

    return { success: true }
  },
})
