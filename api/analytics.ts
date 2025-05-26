import { convex } from "@/lib/convex/convex-client"

/**
 * Get booking analytics
 */
export async function getBookingAnalytics(
  tenantId: string,
  filters?: {
    startDate?: string
    endDate?: string
    groupBy?: "day" | "week" | "month"
  },
) {
  try {
    return await convex.query("analytics.getBookingAnalytics", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching booking analytics:", error)
    throw new Error("Failed to fetch booking analytics")
  }
}

/**
 * Get client analytics
 */
export async function getClientAnalytics(
  tenantId: string,
  filters?: {
    startDate?: string
    endDate?: string
    groupBy?: "day" | "week" | "month"
  },
) {
  try {
    return await convex.query("analytics.getClientAnalytics", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching client analytics:", error)
    throw new Error("Failed to fetch client analytics")
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(
  tenantId: string,
  filters?: {
    startDate?: string
    endDate?: string
    groupBy?: "day" | "week" | "month"
  },
) {
  try {
    return await convex.query("analytics.getRevenueAnalytics", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching revenue analytics:", error)
    throw new Error("Failed to fetch revenue analytics")
  }
}

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(tenantId: string) {
  try {
    return await convex.query("analytics.getDashboardSummary", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    throw new Error("Failed to fetch dashboard summary")
  }
}
