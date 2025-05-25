import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { currentUser } from "@clerk/nextjs/server"
import { validateTenant } from "./tenant"

export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return userId
}

export async function requireTenantAccess(tenantId: string) {
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

  // Check if user has access to this tenant
  // This would typically check user metadata or a separate table
  // For MVP, we'll assume the user has access if the tenant exists

  return { userId, user }
}

export async function getSessionUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  return await currentUser()
}
