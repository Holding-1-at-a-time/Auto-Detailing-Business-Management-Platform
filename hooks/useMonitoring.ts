"use client"

import { useCallback } from "react"
import { monitoring } from "@/lib/monitoring/monitoring-service"
import { useTenant } from "./useTenant"
import { useUser } from "@clerk/nextjs"

export function useMonitoring() {
  const { tenantId } = useTenant()
  const { user } = useUser()

  const trackBooking = useCallback(
    (serviceType: string, value: number) => {
      if (tenantId) {
        monitoring.trackBookingCreated(tenantId, serviceType, value)
      }
    },
    [tenantId],
  )

  const trackClient = useCallback(() => {
    if (tenantId) {
      monitoring.trackClientCreated(tenantId)
    }
  }, [tenantId])

  const trackPayment = useCallback(
    (amount: number, status: "success" | "failed") => {
      if (tenantId) {
        monitoring.trackPaymentProcessed(tenantId, amount, status)
      }
    },
    [tenantId],
  )

  const trackIntegration = useCallback(
    (integration: string, event: string, success: boolean) => {
      if (tenantId) {
        monitoring.trackIntegrationEvent(tenantId, integration, event, success)
      }
    },
    [tenantId],
  )

  const trackUserAction = useCallback(
    (action: string, metadata?: Record<string, any>) => {
      if (tenantId) {
        monitoring.trackUserAction(action, tenantId, user?.id, metadata)
      }
    },
    [tenantId, user?.id],
  )

  const trackFeature = useCallback(
    (feature: string) => {
      if (tenantId) {
        monitoring.trackFeatureUsage(feature, tenantId, user?.id)
      }
    },
    [tenantId, user?.id],
  )

  const trackError = useCallback(
    (
      error: Error,
      context?: {
        component?: string
        operation?: string
        severity?: "low" | "medium" | "high" | "critical"
      },
    ) => {
      monitoring.trackError(error, {
        ...context,
        tenantId: tenantId || undefined,
        userId: user?.id,
      })
    },
    [tenantId, user?.id],
  )

  return {
    trackBooking,
    trackClient,
    trackPayment,
    trackIntegration,
    trackUserAction,
    trackFeature,
    trackError,
  }
}
