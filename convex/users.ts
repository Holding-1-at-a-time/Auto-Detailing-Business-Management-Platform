import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    return users[0] || null
  },
})

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect()

    return users[0] || null
  },
})

export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    if (existingUsers.length > 0) {
      return existingUsers[0]._id
    }

    const now = Date.now()

    // Create new user
    const userId = await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      tenants: [],
      createdAt: now,
      updatedAt: now,
    })

    return userId
  },
})

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    const user = users[0]
    if (!user) {
      throw new Error("User not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.email !== undefined) updates.email = args.email

    await ctx.db.patch(user._id, updates)

    return user._id
  },
})

export const addTenantToUser = mutation({
  args: {
    userId: v.string(),
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    const user = users[0]
    if (!user) {
      throw new Error("User not found")
    }

    // Check if tenant already exists in user's tenants
    if (user.tenants.includes(args.tenantId)) {
      return user._id
    }

    // Add tenant to user
    await ctx.db.patch(user._id, {
      tenants: [...user.tenants, args.tenantId],
      updatedAt: Date.now(),
    })

    return user._id
  },
})

export const removeTenantFromUser = mutation({
  args: {
    userId: v.string(),
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()

    const user = users[0]
    if (!user) {
      throw new Error("User not found")
    }

    // Remove tenant from user
    const updatedTenants = user.tenants.filter((id) => id !== args.tenantId)

    await ctx.db.patch(user._id, {
      tenants: updatedTenants,
      updatedAt: Date.now(),
    })

    return user._id
  },
})
