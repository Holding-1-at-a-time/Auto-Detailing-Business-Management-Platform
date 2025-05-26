import { api } from "../../convex/_generated/api"
import { convex, getTenantScopedClient } from "./convex-client"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Utility functions for Convex database operations
 * Replacement for functionality that might have been in @convexus/shared
 */

/**
 * Type-safe wrapper for tenant-scoped queries
 * @param tenantId - The tenant ID
 */
export function createTenantClient<T extends string>(tenantId: Id<"tenants">) {
  const client = getTenantScopedClient(tenantId as string)

  return {
    /**
     * Execute a query with tenant context
     */
    query: async <TPath extends keyof typeof api.query>(
      path: TPath,
      args: Omit<Parameters<(typeof api.query)[TPath]>[0], "tenantId">,
    ) => {
      return await client.query(path as string, args)
    },

    /**
     * Execute a mutation with tenant context
     */
    mutation: async <TPath extends keyof typeof api.mutation>(
      path: TPath,
      args: Omit<Parameters<(typeof api.mutation)[TPath]>[0], "tenantId">,
    ) => {
      return await client.mutation(path as string, args)
    },

    /**
     * Execute an action with tenant context
     */
    action: async <TPath extends keyof typeof api.action>(
      path: TPath,
      args: Omit<Parameters<(typeof api.action)[TPath]>[0], "tenantId">,
    ) => {
      return await client.action(path as string, args)
    },
  }
}

/**
 * Batch operations helper for Convex
 * @param operations - Array of operations to perform
 */
export async function batchOperations<T>(operations: Array<() => Promise<T>>, concurrency = 5): Promise<T[]> {
  const results: T[] = []
  const chunks = []

  // Split operations into chunks based on concurrency
  for (let i = 0; i < operations.length; i += concurrency) {
    chunks.push(operations.slice(i, i + concurrency))
  }

  // Process chunks sequentially, but operations within chunks concurrently
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map((op) => op()))
    results.push(...chunkResults)
  }

  return results
}

/**
 * Error handler for Convex operations
 */
export function handleConvexError(error: unknown): { message: string; code?: string } {
  if (error instanceof Error) {
    // Extract error code if available (e.g., "CONFLICT", "NOT_FOUND")
    const errorCode = (error as any).code || "UNKNOWN_ERROR"
    return {
      message: error.message,
      code: errorCode,
    }
  }
  return {
    message: String(error),
    code: "UNKNOWN_ERROR",
  }
}

/**
 * Data transformation utilities
 */
export const dataTransformers = {
  /**
   * Convert Convex document to a plain object with ID
   */
  documentToObject: <T extends object>(doc: T & { _id: Id<any> }): T & { id: string } => {
    const { _id, ...rest } = doc
    return {
      ...rest,
      id: _id as string,
    } as T & { id: string }
  },

  /**
   * Convert array of Convex documents to plain objects
   */
  documentsToObjects: <T extends object>(docs: Array<T & { _id: Id<any> }>): Array<T & { id: string }> => {
    return docs.map(dataTransformers.documentToObject)
  },

  /**
   * Prepare data for insertion by removing id field
   */
  prepareForInsert: <T extends { id?: string }>(data: T): Omit<T, "id"> => {
    const { id, ...rest } = data
    return rest
  },
}

/**
 * Pagination utilities for Convex queries
 */
export const paginationUtils = {
  /**
   * Create pagination parameters for Convex queries
   */
  createPaginationParams: (page: number, pageSize: number) => {
    return {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    }
  },

  /**
   * Create a cursor-based pagination token
   */
  createCursorPagination: <T, U extends string | number>(items: T[], getCursor: (item: T) => U, pageSize: number) => {
    const hasMore = items.length > pageSize
    const paginatedItems = hasMore ? items.slice(0, pageSize) : items
    const nextCursor =
      hasMore && paginatedItems.length > 0 ? getCursor(paginatedItems[paginatedItems.length - 1]) : null

    return {
      items: paginatedItems,
      nextCursor,
      hasMore,
    }
  },
}

/**
 * Tenant utilities
 */
export const tenantUtils = {
  /**
   * Get current tenant ID from URL
   */
  getTenantIdFromUrl: (): string | null => {
    if (typeof window === "undefined") return null

    const path = window.location.pathname
    const tenantMatch = path.match(/\/tenant\/([^/]+)/)
    return tenantMatch ? tenantMatch[1] : null
  },

  /**
   * Check if user has access to tenant
   */
  checkTenantAccess: async (userId: string, tenantId: Id<"tenants">): Promise<boolean> => {
    try {
      const result = await convex.query(api.tenants.checkUserAccess, {
        userId,
        tenantId,
      })
      return !!result
    } catch (error) {
      console.error("Error checking tenant access:", error)
      return false
    }
  },
}

/**
 * Query builder helpers
 */
export const queryBuilders = {
  /**
   * Build a filter object for Convex queries
   */
  buildFilter: <T extends Record<string, any>>(filters: Partial<T>): Partial<T> => {
    return Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key as keyof T] = value
        }
        return acc
      },
      {} as Partial<T>,
    )
  },

  /**
   * Build a search object for text search
   */
  buildSearchQuery: (searchTerm: string, fields: string[]): Record<string, any> => {
    if (!searchTerm) return {}

    // Create OR conditions for each field
    const searchConditions = fields.map((field) => ({
      [field]: { $contains: searchTerm },
    }))

    return { $or: searchConditions }
  },
}

/**
 * Caching utilities
 */
export const cacheUtils = {
  /**
   * Create a cache key for Convex queries
   */
  createCacheKey: (queryName: string, params: Record<string, any>): string => {
    return `${queryName}:${JSON.stringify(params)}`
  },

  /**
   * Invalidate all queries with a specific prefix
   */
  invalidateQueriesWithPrefix: (prefix: string) => {
    // This would need to be implemented with your caching solution
    console.log(`Invalidating queries with prefix: ${prefix}`)
  },
}

/**
 * Audit logging utilities
 */
export const auditUtils = {
  /**
   * Log an audit event
   */
  logAuditEvent: async (
    tenantId: Id<"tenants">,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>,
  ) => {
    try {
      await convex.mutation(api.auditLog.createAuditLog, {
        tenantId,
        userId,
        action,
        resourceType,
        resourceId,
        details: details || {},
      })
    } catch (error) {
      console.error("Error logging audit event:", error)
    }
  },
}

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate phone number format
   */
  isValidPhone: (phone: string): boolean => {
    // Basic validation - can be enhanced for specific formats
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(phone.replace(/[\s-()]/g, ""))
  },

  /**
   * Validate date format
   */
  isValidDate: (date: string): boolean => {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  },
}

/**
 * Booking-specific utilities
 */
export const bookingUtils = {
  /**
   * Check for booking conflicts
   */
  checkBookingConflicts: async (
    tenantId: Id<"tenants">,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: Id<"bookings">,
  ): Promise<boolean> => {
    try {
      const result = await convex.query(api.bookings.checkTimeConflicts, {
        tenantId,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        excludeBookingId,
      })
      return result.hasConflicts
    } catch (error) {
      console.error("Error checking booking conflicts:", error)
      return true // Assume conflict on error to be safe
    }
  },

  /**
   * Calculate booking duration based on service
   */
  calculateBookingDuration: async (tenantId: Id<"tenants">, serviceId: Id<"services">): Promise<number> => {
    try {
      const service = await convex.query(api.services.getService, {
        tenantId,
        serviceId,
      })
      return service?.durationMinutes || 60 // Default to 60 minutes
    } catch (error) {
      console.error("Error calculating booking duration:", error)
      return 60 // Default to 60 minutes on error
    }
  },
}

/**
 * Client-specific utilities
 */
export const clientUtils = {
  /**
   * Search for clients by name, email, or phone
   */
  searchClients: async (tenantId: Id<"tenants">, searchTerm: string, limit = 10) => {
    try {
      return await convex.query(api.clients.searchClients, {
        tenantId,
        search: searchTerm,
        limit,
      })
    } catch (error) {
      console.error("Error searching clients:", error)
      return []
    }
  },

  /**
   * Get client booking history
   */
  getClientBookingHistory: async (tenantId: Id<"tenants">, clientId: Id<"clients">) => {
    try {
      return await convex.query(api.bookings.getBookingsByClient, {
        tenantId,
        clientId,
      })
    } catch (error) {
      console.error("Error getting client booking history:", error)
      return []
    }
  },
}

/**
 * Export all utilities
 */
export const convexUtils = {
  auditUtils,
  batchOperations,
  bookingUtils,
  cacheUtils,
  clientUtils,
  createTenantClient,
  dataTransformers,
  handleConvexError,
  paginationUtils,
  queryBuilders,
  tenantUtils,
  validationUtils,
}

export default convexUtils
