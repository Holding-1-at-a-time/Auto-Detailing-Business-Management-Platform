"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "./useTenant"
import { useToast } from "./use-toast"

export function useTenantSettings() {
  const { tenant } = useTenant()
  const { toast } = useToast()

  const settings = useQuery(api.tenants.getTenantSettings, tenant ? { tenantId: tenant._id } : "skip")

  const updateSettings = useMutation(api.tenants.updateTenantSettings)

  const updateTenantSettings = async (updates: {
    businessName?: string
    timezone?: string
    logoUrl?: string
    calendarConnected?: boolean
  }) => {
    if (!tenant) return

    try {
      await updateSettings({
        tenantId: tenant._id,
        ...updates,
      })

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    }
  }

  return {
    settings,
    updateTenantSettings,
    isLoading: settings === undefined,
  }
}
