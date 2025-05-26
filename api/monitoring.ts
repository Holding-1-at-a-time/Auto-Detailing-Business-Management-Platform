import { convex } from "@/lib/convex/convex-client"

/**
 * Get system health status
 */
export async function getSystemHealth(tenantId: string) {
  try {
    return await convex.query("systemHealth.getStatus", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching system health:", error)
    throw new Error("Failed to fetch system health")
  }
}

/**
 * Get integration health status
 */
export async function getIntegrationHealth(tenantId: string) {
  try {
    return await convex.query("systemHealth.getIntegrationStatus", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching integration health:", error)
    throw new Error("Failed to fetch integration health")
  }
}

/**
 * Get error logs
 */
export async function getErrorLogs(
  tenantId: string,
  filters?: {
    startDate?: string
    endDate?: string
    limit?: number
    severity?: "low" | "medium" | "high" | "critical"
  },
) {
  try {
    return await convex.query("systemHealth.getErrorLogs", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching error logs:", error)
    throw new Error("Failed to fetch error logs")
  }
}

/**
 * Log an error
 */
export async function logError(
  tenantId: string,
  data: {
    message: string
    source: string
    severity: "low" | "medium" | "high" | "critical"
    context?: Record<string, any>
  },
) {
  try {
    return await convex.mutation("systemHealth.logError", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error logging error:", error)
    // Don't throw here to prevent cascading errors
    return null
  }
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(
  tenantId: string,
  filters?: {
    startDate?: string
    endDate?: string
    groupBy?: "hour" | "day" | "week"
  },
) {
  try {
    return await convex.query("systemHealth.getPerformanceMetrics", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    throw new Error("Failed to fetch performance metrics")
  }
}
