"use client"

import { useQuery, useMutation } from "convex/react"
import { useTenant } from "./useTenant"
import type { Client } from "@/lib/types"

interface ClientFilters {
  search?: string
  limit?: number
  includeDeleted?: boolean
}

export function useClients(filters: ClientFilters = {}) {
  const { tenantId } = useTenant()

  const clients = useQuery("clients.getClients", {
    tenantId,
    ...filters,
  }) as Client[] | undefined

  const createClientMutation = useMutation("clients.createClient")
  const updateClientMutation = useMutation("clients.updateClient")
  const deleteClientMutation = useMutation("clients.deleteClient")

  const createClient = async (data: Omit<Client, "id" | "tenantId" | "isDeleted" | "createdAt" | "updatedAt">) => {
    return await createClientMutation({
      tenantId,
      ...data,
    })
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    return await updateClientMutation({
      tenantId,
      id,
      ...updates,
    })
  }

  const deleteClient = async (id: string) => {
    return await updateClientMutation({
      tenantId,
      id,
      isDeleted: true,
    })
  }

  return {
    clients,
    isLoading: clients === undefined,
    createClient,
    updateClient,
    deleteClient,
  }
}
