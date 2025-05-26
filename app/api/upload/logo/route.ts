import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string

    if (!file || !tenantId) {
      return NextResponse.json({ error: "File and tenant ID are required" }, { status: 400 })
    }

    // Verify user has access to this tenant
    const userTenants = await convex.query(api.tenants.getUserTenants, { userId })
    const hasAccess = userTenants.some((t) => t?._id === tenantId)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied to this tenant" }, { status: 403 })
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 },
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to base64 for storage (in a real app, you'd upload to a service like AWS S3)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Store the logo URL in Convex
    await convex.mutation(api.tenants.updateTenantLogo, {
      tenantId,
      logoUrl: dataUrl,
    })

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("Error uploading logo:", error)
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
  }
}
