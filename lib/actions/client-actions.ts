"use server"

import { revalidatePath } from "next/cache"
import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"
import { handleConvexError } from "../convex/convex-utils"

/**
 * Get clients with optional filtering and pagination
 */
export async function getClients(
  tenantId: Id<"tenants">,
  options?: {
    search?: string
    limit?: number
    skip?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  },
) {
  try {
    const result = await convex.query(api.clients.listClients, {
      tenantId,
      search: options?.search || "",
      limit: options?.limit || 50,
      skip: options?.skip || 0,
      sortBy: options?.sortBy || "createdAt",
      sortOrder: options?.sortOrder || "desc",
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error fetching clients:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Get a single client by ID
 */
export async function getClient(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    const client = await convex.query(api.clients.getClient, {
      tenantId,
      clientId,
    })

    return {
      success: true,
      data: client,
    }
  } catch (error) {
    console.error("Error fetching client:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Create a new client
 */
export async function createClient(
  tenantId: Id<"tenants">,
  clientData: {
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
  },
) {
  try {
    const clientId = await convex.mutation(api.clients.createClient, {
      tenantId,
      ...clientData,
    })

    revalidatePath("/clients")
    return {
      success: true,
      data: { id: clientId },
    }
  } catch (error) {
    console.error("Error creating client:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Update an existing client
 */
export async function updateClient(
  tenantId: Id<"tenants">,
  clientId: Id<"clients">,
  clientData: {
    name?: string
    email?: string
    phone?: string
    address?: string
    notes?: string
  },
) {
  try {
    await convex.mutation(api.clients.updateClient, {
      tenantId,
      clientId,
      ...clientData,
    })

    revalidatePath(`/clients/${clientId}`)
    revalidatePath("/clients")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating client:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Delete a client
 */
export async function deleteClient(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    await convex.mutation(api.clients.deleteClient, {
      tenantId,
      clientId,
    })

    revalidatePath("/clients")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting client:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Search clients by name, email, or phone
 */
export async function searchClients(tenantId: Id<"tenants">, searchTerm: string, limit = 10) {
  try {
    const clients = await convex.query(api.clients.searchClients, {
      tenantId,
      search: searchTerm,
      limit,
    })

    return {
      success: true,
      data: clients,
    }
  } catch (error) {
    console.error("Error searching clients:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
      data: [],
    }
  }
}

/**
 * Get client statistics
 */
export async function getClientStats(tenantId: Id<"tenants">) {
  try {
    const stats = await convex.query(api.clientAnalytics.getClientStats, {
      tenantId,
    })

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error("Error fetching client stats:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Add a note to a client
 */
export async function addClientNote(tenantId: Id<"tenants">, clientId: Id<"clients">, note: string, userId: string) {
  try {
    await convex.mutation(api.clients.addClientNote, {
      tenantId,
      clientId,
      note,
      userId,
    })

    revalidatePath(`/clients/${clientId}`)
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error adding client note:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Import clients from CSV
 */
export async function importClientsFromCsv(tenantId: Id<"tenants">, csvData: string) {
  try {
    const result = await convex.action(api.clients.importClientsFromCsv, {
      tenantId,
      csvData,
    })

    revalidatePath("/clients")
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error importing clients:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}

/**
 * Export clients to CSV
 */
export async function exportClientsToCsv(tenantId: Id<"tenants">) {
  try {
    const csvData = await convex.action(api.clients.exportClientsToCsv, {
      tenantId,
    })

    return {
      success: true,
      data: csvData,
    }
  } catch (error) {
    console.error("Error exporting clients:", error)
    return {
      success: false,
      error: handleConvexError(error).message,
    }
  }
}
