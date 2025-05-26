import { convex } from "@/lib/convex/convex-client"
import type { Client } from "@/lib/types"

/**
 * Get all clients with optional filters
 */
export async function getClients(
  tenantId: string,
  filters?: {
    search?: string
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    lastActive?: number
  },
) {
  try {
    return await convex.query("clients.getClients", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    throw new Error("Failed to fetch clients")
  }
}

/**
 * Get a single client by ID
 */
export async function getClient(tenantId: string, clientId: string) {
  try {
    return await convex.query("clients.getClientById", {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client:", error)
    throw new Error("Failed to fetch client")
  }
}

/**
 * Create a new client
 */
export async function createClient(tenantId: string, data: Omit<Client, "id">) {
  try {
    return await convex.mutation("clients.createClient", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    throw new Error("Failed to create client")
  }
}

/**
 * Update an existing client
 */
export async function updateClient(tenantId: string, clientId: string, data: Partial<Client>) {
  try {
    return await convex.mutation("clients.updateClient", {
      tenantId,
      clientId,
      ...data,
    })
  } catch (error) {
    console.error("Error updating client:", error)
    throw new Error("Failed to update client")
  }
}

/**
 * Delete a client (archive)
 */
export async function deleteClient(tenantId: string, clientId: string) {
  try {
    return await convex.mutation("clients.deleteClient", {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error deleting client:", error)
    throw new Error("Failed to delete client")
  }
}

/**
 * Get client statistics
 */
export async function getClientStats(tenantId: string) {
  try {
    return await convex.query("clients.getClientStats", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching client stats:", error)
    throw new Error("Failed to fetch client statistics")
  }
}
