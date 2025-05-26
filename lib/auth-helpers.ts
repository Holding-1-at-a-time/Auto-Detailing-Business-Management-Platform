import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { validateTenant } from "./tenant"

export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return userId
}

export async function requireRole(requiredRole: "admin" | "manager" | "staff" | "user") {
  const userId = await requireAuth()
  const user = await clerkClient.users.getUser(userId)

  const userRole = user.publicMetadata.role as string | undefined

  if (!userRole) {
    redirect("/access-denied")
  }

  // Admin/owner can access everything
  if (userRole === "admin" || userRole === "owner") {
    return { userId, user }
  }

  // Check specific role requirements
  if (requiredRole === "user") {
    // Any role can access user-level routes
    return { userId, user }
  } else if (requiredRole === "staff" && ["staff", "manager"].includes(userRole)) {
    // Staff and manager can access staff-level routes
    return { userId, user }
  } else if (requiredRole === "manager" && userRole === "manager") {
    // Only manager can access manager-level routes
    return { userId, user }
  }

  // Not authorized
  redirect("/access-denied")
}

export async function requireTenantAccess(tenantId: string, requiredRole?: "admin" | "manager" | "staff" | "user") {
  const userId = await requireAuth()
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Check if tenant exists
  const tenantExists = await validateTenant(tenantId)
  if (!tenantExists) {
    redirect("/tenant-not-found")
  }

  // If a specific role is required, check it
  if (requiredRole) {
    const userRole = user.publicMetadata.role as string | undefined

    if (!userRole) {
      redirect("/access-denied")
    }

    // Admin/owner can access everything
    if (userRole === "admin" || userRole === "owner") {
      return { userId, user }
    }

    // Check specific role requirements
    if (requiredRole === "user") {
      // Any role can access user-level routes
      return { userId, user }
    } else if (requiredRole === "staff" && ["staff", "manager"].includes(userRole)) {
      // Staff and manager can access staff-level routes
      return { userId, user }
    } else if (requiredRole === "manager" && userRole === "manager") {
      // Only manager can access manager-level routes
      return { userId, user }
    }

    // Not authorized
    redirect("/access-denied")
  }

  return { userId, user }
}

export async function getSessionUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  return await currentUser()
}
