import { type NextRequest, NextResponse } from "next/server"
import { requireTenantAccess } from "@/lib/auth"
import { convex } from "@/lib/convex/convex-client"

export async function GET(request: NextRequest, { params }: { params: { tenant: string; clientId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    const client = await convex.query("clients.getClientById", {
      tenantId: params.tenant,
      clientId: params.clientId,
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client details" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tenant: string; clientId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    const data = await request.json()

    const result = await convex.mutation("clients.updateClient", {
      tenantId: params.tenant,
      clientId: params.clientId,
      ...data,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tenant: string; clientId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    // Soft delete - mark as deleted but keep the record
    const result = await convex.mutation("clients.deleteClient", {
      tenantId: params.tenant,
      clientId: params.clientId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
