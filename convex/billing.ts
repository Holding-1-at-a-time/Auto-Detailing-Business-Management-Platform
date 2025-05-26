import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getBillingInfo = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    // Get billing information for the tenant
    const billing = await ctx.db
      .query("billingInfo")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    return billing
  },
})

export const getUsageMetrics = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count bookings this month
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.gte(q.field("createdAt"), startOfMonth.getTime()))
      .collect()

    // Count active clients
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect()

    // Get billing info to check limits
    const billing = await ctx.db
      .query("billingInfo")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    return {
      bookingsThisMonth: bookings.length,
      activeClients: clients.length,
      bookingLimit: billing?.bookingLimit,
      clientLimit: billing?.clientLimit,
    }
  },
})

export const createPortalSession = mutation({
  args: {
    tenantId: v.id("tenants"),
    organizationId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Get or create Stripe customer for the organization
    const billing = await ctx.db
      .query("billingInfo")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    let customerId = billing?.stripeCustomerId

    if (!customerId) {
      // Create new Stripe customer
      // This would typically involve calling Stripe API
      // For now, we'll simulate it
      customerId = `cus_${Math.random().toString(36).substr(2, 9)}`

      await ctx.db.insert("billingInfo", {
        tenantId: args.tenantId,
        organizationId: args.organizationId,
        stripeCustomerId: customerId,
        planName: "Free",
        status: "active",
        features: ["Basic booking management", "Up to 50 bookings/month"],
        bookingLimit: 50,
        clientLimit: 100,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // In a real implementation, you would create a Stripe billing portal session here
    // For now, we'll return a mock URL
    const portalUrl = `https://billing.stripe.com/p/session/${customerId}`

    return portalUrl
  },
})

export const updateBillingStatus = mutation({
  args: {
    tenantId: v.id("tenants"),
    planName: v.string(),
    status: v.string(),
    features: v.array(v.string()),
    bookingLimit: v.optional(v.number()),
    clientLimit: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const billing = await ctx.db
      .query("billingInfo")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first()

    if (billing) {
      await ctx.db.patch(billing._id, {
        planName: args.planName,
        status: args.status,
        features: args.features,
        bookingLimit: args.bookingLimit,
        clientLimit: args.clientLimit,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("billingInfo", {
        tenantId: args.tenantId,
        planName: args.planName,
        status: args.status,
        features: args.features,
        bookingLimit: args.bookingLimit,
        clientLimit: args.clientLimit,
        currentPeriodEnd: args.currentPeriodEnd,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const handleStripeWebhook = mutation({
  args: {
    eventType: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { eventType, data } = args

    switch (eventType) {
      case "checkout.session.completed":
        // Handle successful subscription creation
        const { customer, subscription, metadata } = data
        const tenantId = metadata?.tenantId

        if (tenantId) {
          await ctx.db
            .query("billingInfo")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
            .first()
            .then(async (billing) => {
              if (billing) {
                await ctx.db.patch(billing._id, {
                  stripeCustomerId: customer,
                  stripeSubscriptionId: subscription,
                  status: "active",
                  updatedAt: Date.now(),
                })
              }
            })
        }
        break

      case "invoice.payment_succeeded":
        // Handle successful payment
        const { subscription_id } = data
        const billingRecord = await ctx.db
          .query("billingInfo")
          .filter((q) => q.eq(q.field("stripeSubscriptionId"), subscription_id))
          .first()

        if (billingRecord) {
          await ctx.db.patch(billingRecord._id, {
            status: "active",
            updatedAt: Date.now(),
          })
        }
        break

      case "invoice.payment_failed":
        // Handle failed payment
        const { subscription_id: failedSubId } = data
        const failedBilling = await ctx.db
          .query("billingInfo")
          .filter((q) => q.eq(q.field("stripeSubscriptionId"), failedSubId))
          .first()

        if (failedBilling) {
          await ctx.db.patch(failedBilling._id, {
            status: "past_due",
            updatedAt: Date.now(),
          })
        }
        break

      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const { id: canceledSubId } = data
        const canceledBilling = await ctx.db
          .query("billingInfo")
          .filter((q) => q.eq(q.field("stripeSubscriptionId"), canceledSubId))
          .first()

        if (canceledBilling) {
          await ctx.db.patch(canceledBilling._id, {
            status: "canceled",
            planName: "Free",
            features: ["Basic booking management", "Up to 50 bookings/month"],
            bookingLimit: 50,
            clientLimit: 100,
            updatedAt: Date.now(),
          })
        }
        break
    }

    return { success: true }
  },
})
