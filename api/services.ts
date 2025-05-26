import { convex } from "@/lib/convex/convex-client"
import type { Service } from "@/lib/types"

/**
 * Get all services for a tenant
 */
export async function getServices(tenantId: string) {
  try {
    return await convex.query("services.getServices", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    throw new Error("Failed to fetch services")
  }
}

/**
 * Get a service by ID
 */
export async function getService(tenantId: string, serviceId: string) {
  try {
    return await convex.query("services.getServiceById", {
      tenantId,
      serviceId,
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    throw new Error("Failed to fetch service")
  }
}

/**
 * Create a new service
 */
export async function createService(tenantId: string, data: Omit<Service, "id">) {
  try {
    return await convex.mutation("services.createService", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

/**
 * Update an existing service
 */
export async function updateService(tenantId: string, serviceId: string, data: Partial<Service>) {
  try {
    return await convex.mutation("services.updateService", {
      tenantId,
      serviceId,
      ...data,
    })
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service")
  }
}

/**
 * Delete a service
 */
export async function deleteService(tenantId: string, serviceId: string) {
  try {
    return await convex.mutation("services.deleteService", {
      tenantId,
      serviceId,
    })
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }
}
