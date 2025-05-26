import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tenantId } = await request.json()

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    // Verify user has access to this tenant
    const userTenants = await convex.query(api.tenants.getUserTenants, { userId })
    const hasAccess = userTenants.some((t) => t?._id === tenantId)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this tenant" }, { status: 403 })
    }

    // Create billing portal session
    const portalUrl = await convex.mutation(api.billing.createPortalSession, {
      tenantId,
      organizationId: orgId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    })

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
