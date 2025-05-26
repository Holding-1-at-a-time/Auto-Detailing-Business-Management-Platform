"use server"

import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"

export async function getTenantBySlug(slug: string) {
  try {
    const tenant = await fetchQuery(api.tenants.getBySlug, { slug })
    return tenant
  } catch (error) {
    console.error("Error fetching tenant:", error)
    return null
  }
}
