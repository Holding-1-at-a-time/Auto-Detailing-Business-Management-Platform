import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Specialized utilities for auto-detailing client analytics
 */

/**
 * Get client lifetime value
 * @param tenantId - The tenant ID
 * @param clientId - The client ID
 * @returns Client lifetime value data
 */
export async function getClientLifetimeValue(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    return await convex.query(api.clientAnalytics.getClientLifetimeValue, {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client lifetime value:", error)
    return {
      totalSpent: 0,
      bookingCount: 0,
      averageBookingValue: 0,
      firstBookingDate: null,
      lastBookingDate: null,
    }
  }
}

/**
 * Get client service preferences
 * @param tenantId - The tenant ID
 * @param clientId - The client ID
 * @returns Client service preference data
 */
export async function getClientServicePreferences(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    return await convex.query(api.clientAnalytics.getClientServicePreferences, {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client service preferences:", error)
    return []
  }
}

/**
 * Get client booking frequency
 * @param tenantId - The tenant ID
 * @param clientId - The client ID
 * @returns Client booking frequency data
 */
export async function getClientBookingFrequency(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    return await convex.query(api.clientAnalytics.getClientBookingFrequency, {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client booking frequency:", error)
    return {
      averageDaysBetweenBookings: 0,
      totalBookings: 0,
      bookingDates: [],
    }
  }
}

/**
 * Get top clients by revenue
 * @param tenantId - The tenant ID
 * @param limit - Maximum number of clients to return
 * @param timeframe - Timeframe in days (default: 365)
 * @returns Array of top clients
 */
export async function getTopClientsByRevenue(tenantId: Id<"tenants">, limit = 10, timeframe = 365) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    return await convex.query(api.clientAnalytics.getTopClients, {
      tenantId,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      limit,
      sortBy: "revenue",
    })
  } catch (error) {
    console.error("Error fetching top clients by revenue:", error)
    return []
  }
}

/**
 * Get client retention rate
 * @param tenantId - The tenant ID
 * @param timeframe - Timeframe in days
 * @returns Client retention data
 */
export async function getClientRetentionRate(tenantId: Id<"tenants">, timeframe = 365) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    return await convex.query(api.clientAnalytics.getClientRetentionRate, {
      tenantId,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    })
  } catch (error) {
    console.error("Error fetching client retention rate:", error)
    return {
      retentionRate: 0,
      returningClients: 0,
      totalClients: 0,
    }
  }
}
