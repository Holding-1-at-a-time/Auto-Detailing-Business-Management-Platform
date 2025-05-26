"use server"

import { convex } from "@/lib/convex/convex-client"

export async function getTenantBySlug(slug: string) {
  try {
    return await convex.query("tenants.getTenantBySlug", {
      slug,
    })
  } catch (error) {
    console.error("Error fetching tenant by slug:", error)
    return null
  }
}
