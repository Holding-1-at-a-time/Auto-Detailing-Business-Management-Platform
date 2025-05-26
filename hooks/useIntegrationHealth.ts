"use client"

import { useEffect, useCallback, useState } from "react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "./useTenant"
import { useNotifications } from "./useNotifications"

interface IntegrationStatus {
  name: string
  status: "healthy" | "degraded" | "down"
  lastChecked: number
  error?: string
}

export function useIntegrationHealth() {
  const { tenantId } = useTenant()
  const convex = useConvex()
  const { showToast } = useNotifications()
  const [healthStatus, setHealthStatus] = useState<IntegrationStatus[]>([])

  // Monitor integration health
  useEffect(() => {
    if (!tenantId) return

    const checkHealth = async () => {
      try {
        const status = await convex.query(api.integrations.getHealthStatus, {
          tenantId,
        })

        setHealthStatus(status)

        // Alert on integration failures
        status.forEach((integration: IntegrationStatus) => {
          if (integration.status === "down") {
            showToast(`${integration.name} integration is down: ${integration.error}`, "error")
          } else if (integration.status === "degraded") {
            showToast(`${integration.name} integration is experiencing issues`, "warning")
          }
        })
      } catch (error) {
        console.error("Failed to check integration health:", error)
      }
    }

    // Check immediately and then every 5 minutes
    checkHealth()
    const interval = setInterval(checkHealth, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tenantId, convex, showToast])

  const testIntegration = useCallback(
    async (integrationName: string) => {
      if (!tenantId) return

      try {
        const result = await convex.mutation(api.integrations.testIntegration, {
          tenantId,
          integrationName,
        })

        if (result.success) {
          showToast(`${integrationName} integration test successful`, "success")
        } else {
          showToast(`${integrationName} integration test failed: ${result.error}`, "error")
        }

        return result
      } catch (error) {
        showToast(`Failed to test ${integrationName} integration`, "error")
        return { success: false, error: error.message }
      }
    },
    [tenantId, convex, showToast],
  )

  const reconnectIntegration = useCallback(
    async (integrationName: string) => {
      if (!tenantId) return

      try {
        await convex.mutation(api.integrations.reconnectIntegration, {
          tenantId,
          integrationName,
        })

        showToast(`Attempting to reconnect ${integrationName}...`, "info")
      } catch (error) {
        showToast(`Failed to reconnect ${integrationName}`, "error")
      }
    },
    [tenantId, convex, showToast],
  )

  return {
    healthStatus,
    testIntegration,
    reconnectIntegration,
  }
}
