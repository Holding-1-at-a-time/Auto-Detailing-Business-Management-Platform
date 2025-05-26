import { type NextRequest, NextResponse } from "next/server"
import { requireTenantAccess } from "@/lib/auth"
import { convex } from "@/lib/convex/convex-client"

export async function POST(request: NextRequest, { params }: { params: { tenant: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    const data = await request.json()

    // Validate required fields
    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format if provided
    if (data.phone && !/^[0-9+\-\s()]{7,20}$/.test(data.phone)) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 })
    }

    const result = await convex.mutation("clients.createClient", {
      tenantId: params.tenant,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    })

    return NextResponse.json({ id: result })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
