import { convex } from "@/lib/convex/convex-client"
import type { User } from "@/lib/types"

/**
 * Get a user by ID
 */
export async function getUser(userId: string) {
  try {
    return await convex.query("users.getUserById", {
      userId,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    throw new Error("Failed to fetch user")
  }
}

/**
 * Get users for a tenant
 */
export async function getTenantUsers(tenantId: string) {
  try {
    return await convex.query("users.getTenantUsers", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching tenant users:", error)
    throw new Error("Failed to fetch tenant users")
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Partial<User>) {
  try {
    return await convex.mutation("users.updateProfile", {
      userId,
      ...data,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

/**
 * Add user to tenant
 */
export async function addUserToTenant(tenantId: string, userId: string, role: string) {
  try {
    return await convex.mutation("users.addToTenant", {
      tenantId,
      userId,
      role,
    })
  } catch (error) {
    console.error("Error adding user to tenant:", error)
    throw new Error("Failed to add user to tenant")
  }
}

/**
 * Remove user from tenant
 */
export async function removeUserFromTenant(tenantId: string, userId: string) {
  try {
    return await convex.mutation("users.removeFromTenant", {
      tenantId,
      userId,
    })
  } catch (error) {
    console.error("Error removing user from tenant:", error)
    throw new Error("Failed to remove user from tenant")
  }
}
