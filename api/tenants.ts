import { convex } from "@/lib/convex/convex-client"
import type { TenantSettings } from "@/lib/types"

/**
 * Get a tenant by ID
 */
export async function getTenant(tenantId: string) {
  try {
    return await convex.query("tenants.getTenantById", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching tenant:", error)
    throw new Error("Failed to fetch tenant")
  }
}

/**
 * Get a tenant by slug
 */
export async function getTenantBySlug(slug: string) {
  try {
    return await convex.query("tenants.getBySlug", {
      slug,
    })
  } catch (error) {
    console.error("Error fetching tenant by slug:", error)
    throw new Error("Failed to fetch tenant")
  }
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>) {
  try {
    return await convex.mutation("tenants.updateSettings", {
      tenantId,
      settings,
    })
  } catch (error) {
    console.error("Error updating tenant settings:", error)
    throw new Error("Failed to update tenant settings")
  }
}

/**
 * Get tenant settings
 */
export async function getTenantSettings(tenantId: string) {
  try {
    return await convex.query("tenants.getSettings", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching tenant settings:", error)
    throw new Error("Failed to fetch tenant settings")
  }
}

/**
 * Check if tenant slug is available
 */
export async function checkSlugAvailability(slug: string) {
  try {
    return await convex.query("tenants.checkSlugAvailability", {
      slug,
    })
  } catch (error) {
    console.error("Error checking slug availability:", error)
    throw new Error("Failed to check slug availability")
  }
}
