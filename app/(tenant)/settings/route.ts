import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { z } from "zod"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const updateSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  calendarConnected: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract tenant ID from URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split("/")
    const tenantIndex = pathSegments.findIndex((segment) => segment === "tenant")

    if (tenantIndex === -1 || !pathSegments[tenantIndex + 1]) {
      return NextResponse.json({ error: "Tenant ID not found in URL" }, { status: 400 })
    }

    const tenantSlug = pathSegments[tenantIndex + 1]

    // Get tenant by slug
    const tenant = await convex.query(api.tenants.getBySlug, { slug: tenantSlug })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Verify user has access to this tenant
    const userTenants = await convex.query(api.tenants.getUserTenants, { userId })
    const hasAccess = userTenants.some((t) => t?._id === tenant._id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this tenant" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Update tenant settings
    await convex.mutation(api.tenants.updateTenantSettings, {
      tenantId: tenant._id,
      ...validatedData,
    })

    // Also update main tenant record if name or timezone changed
    if (validatedData.businessName || validatedData.timezone || validatedData.logoUrl !== undefined) {
      await convex.mutation(api.tenants.updateTenant, {
        tenantId: tenant._id,
        name: validatedData.businessName,
        timezone: validatedData.timezone,
        logoUrl: validatedData.logoUrl || undefined,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
