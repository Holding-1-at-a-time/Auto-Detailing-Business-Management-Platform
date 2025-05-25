import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getClients = query({
  args: {
    tenantId: v.id("tenants"),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let clientsQuery = ctx.db.query("clients").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    // Filter out deleted clients unless explicitly requested
    if (!args.includeDeleted) {
      clientsQuery = clientsQuery.filter((q) => q.eq(q.field("isDeleted"), false))
    }

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      clientsQuery = clientsQuery.filter((q) =>
        q.or(
          q.contains(q.lower(q.field("name")), searchLower),
          q.contains(q.lower(q.field("email") || ""), searchLower),
          q.contains(q.lower(q.field("phone") || ""), searchLower),
        ),
      )
    }

    // Apply limit if provided
    if (args.limit) {
      clientsQuery = clientsQuery.take(args.limit)
    }

    return await clientsQuery.collect()
  },
})

export const getClientById = query({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId)

    if (!client) {
      return null
    }

    // Ensure client belongs to the specified tenant
    if (client.tenantId !== args.tenantId) {
      return null
    }

    return client
  },
})

export const createClient = mutation({
  args: {
    tenantId: v.id("tenants"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Validate tenant exists
    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Create the client
    const clientId = await ctx.db.insert("clients", {
      tenantId: args.tenantId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      notes: args.notes,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    })

    return clientId
  },
})

export const updateClient = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId)

    if (!client) {
      throw new Error("Client not found")
    }

    // Ensure client belongs to the specified tenant
    if (client.tenantId !== args.tenantId) {
      throw new Error("Client does not belong to this tenant")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.email !== undefined) updates.email = args.email
    if (args.phone !== undefined) updates.phone = args.phone
    if (args.notes !== undefined) updates.notes = args.notes
    if (args.isDeleted !== undefined) updates.isDeleted = args.isDeleted

    await ctx.db.patch(args.clientId, updates)

    return args.clientId
  },
})

export const deleteClient = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId)

    if (!client) {
      throw new Error("Client not found")
    }

    // Ensure client belongs to the specified tenant
    if (client.tenantId !== args.tenantId) {
      throw new Error("Client does not belong to this tenant")
    }

    // Soft delete the client
    await ctx.db.patch(args.clientId, {
      isDeleted: true,
      updatedAt: Date.now(),
    })

    return args.clientId
  },
})
