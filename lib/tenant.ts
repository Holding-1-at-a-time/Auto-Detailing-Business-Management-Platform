import type { NextRequest } from "next/server"
import { convex } from "./convex/convex-client"

export function getTenantFromHost(req: NextRequest): string | null {
  const host = req.headers.get("host")
  if (!host) return null

  // Extract subdomain (e.g., acme.autodetailer.app -> acme)
  const hostParts = host.split(".")
  if (hostParts.length > 2) {
    return hostParts[0]
  }

  return null
}

export function getTenantFromPath(params: { tenant?: string }): string | null {
  return params.tenant || null
}

export async function validateTenant(tenantId: string): Promise<boolean> {
  if (!tenantId) return false

  try {
    // Check if tenant exists in Convex
    const tenant = await convex.query("tenants.getTenantById", { tenantId })
    return !!tenant
  } catch (error) {
    console.error("Error validating tenant:", error)
    return false
  }
}

export async function getCurrentTenant(tenantId: string) {
  if (!tenantId) return null

  try {
    return await convex.query("tenants.getTenantById", { tenantId })
  } catch (error) {
    console.error("Error fetching tenant:", error)
    return null
  }
}
