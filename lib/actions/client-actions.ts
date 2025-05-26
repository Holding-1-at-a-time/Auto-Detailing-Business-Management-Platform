"use server"

import { convex } from "@/lib/convex/convex-client"
import type { Client } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function getClients(tenantId: string, options?: { search?: string; limit?: number }) {
  try {
    return await convex.query("clients.getClients", {
      tenantId,
      search: options?.search || "",
      limit: options?.limit || 100,
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getClientById(tenantId: string, clientId: string) {
  try {
    return await convex.query("clients.getClientById", {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client:", error)
    return null
  }
}

export async function createClient(tenantId: string, data: Partial<Client>) {
  try {
    const result = await convex.mutation("clients.createClient", {
      tenantId,
      ...data,
    })

    revalidatePath(`/${tenantId}/clients`)
    return result
  } catch (error) {
    console.error("Error creating client:", error)
    throw new Error("Failed to create client")
  }
}

export async function updateClient(tenantId: string, clientId: string, data: Partial<Client>) {
  try {
    const result = await convex.mutation("clients.updateClient", {
      tenantId,
      clientId,
      ...data,
    })

    revalidatePath(`/${tenantId}/clients`)
    revalidatePath(`/${tenantId}/clients/${clientId}`)
    return result
  } catch (error) {
    console.error("Error updating client:", error)
    throw new Error("Failed to update client")
  }
}

export async function deleteClient(tenantId: string, clientId: string) {
  try {
    const result = await convex.mutation("clients.deleteClient", {
      tenantId,
      clientId,
    })

    revalidatePath(`/${tenantId}/clients`)
    return result
  } catch (error) {
    console.error("Error deleting client:", error)
    throw new Error("Failed to delete client")
  }
}
