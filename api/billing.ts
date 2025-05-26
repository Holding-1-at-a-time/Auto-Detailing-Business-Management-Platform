import { convex } from "@/lib/convex/convex-client"

/**
 * Get billing information for a tenant
 */
export async function getBillingInfo(tenantId: string) {
  try {
    return await convex.query("billing.getBillingInfo", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching billing info:", error)
    throw new Error("Failed to fetch billing info")
  }
}

/**
 * Get subscription details for a tenant
 */
export async function getSubscription(tenantId: string) {
  try {
    return await convex.query("billing.getSubscription", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    throw new Error("Failed to fetch subscription")
  }
}

/**
 * Get usage metrics for a tenant
 */
export async function getUsageMetrics(tenantId: string) {
  try {
    return await convex.query("billing.getUsageMetrics", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching usage metrics:", error)
    throw new Error("Failed to fetch usage metrics")
  }
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession(tenantId: string, priceId: string) {
  try {
    return await convex.action("billing.createCheckoutSession", {
      tenantId,
      priceId,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(tenantId: string) {
  try {
    return await convex.action("billing.createBillingPortalSession", {
      tenantId,
    })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    throw new Error("Failed to create billing portal session")
  }
}
