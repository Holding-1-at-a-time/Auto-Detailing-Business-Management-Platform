"use client"

import { useEffect, useCallback } from "react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "./useTenant"
import { useNotifications } from "./useNotifications"

interface BillingEvent {
  type:
    | "subscription_created"
    | "subscription_updated"
    | "subscription_cancelled"
    | "payment_failed"
    | "usage_limit_reached"
  data: any
  timestamp: number
}

export function useBillingMonitoring() {
  const { tenantId } = useTenant()
  const convex = useConvex()
  const { showToast, sendNotification } = useNotifications()

  // Monitor billing events
  useEffect(() => {
    if (!tenantId) return

    const unsubscribe = convex.watchQuery(
      api.billing.getBillingEvents,
      {
        tenantId,
        since: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
      },
      (events) => {
        if (!events) return

        events.forEach((event: BillingEvent) => {
          handleBillingEvent(event)
        })
      },
    )

    return unsubscribe
  }, [tenantId, convex])

  const handleBillingEvent = useCallback(
    (event: BillingEvent) => {
      switch (event.type) {
        case "subscription_created":
          showToast("Welcome! Your subscription is now active.", "success")
          break
        case "subscription_updated":
          showToast("Your subscription has been updated.", "info")
          break
        case "subscription_cancelled":
          showToast("Your subscription has been cancelled.", "warning")
          break
        case "payment_failed":
          showToast("Payment failed. Please update your payment method.", "error")
          break
        case "usage_limit_reached":
          showToast("You've reached your plan limit. Consider upgrading.", "warning")
          break
      }
    },
    [showToast],
  )

  const trackUsage = useCallback(
    async (metric: string, value: number) => {
      if (!tenantId) return

      try {
        await convex.mutation(api.billing.trackUsage, {
          tenantId,
          metric,
          value,
          timestamp: Date.now(),
        })
      } catch (error) {
        console.error("Failed to track usage:", error)
      }
    },
    [tenantId, convex],
  )

  const checkLimits = useCallback(async () => {
    if (!tenantId) return

    try {
      const limits = await convex.query(api.billing.checkUsageLimits, {
        tenantId,
      })

      if (limits.nearLimit) {
        showToast(`You're approaching your ${limits.metric} limit (${limits.usage}/${limits.limit})`, "warning")
      }

      return limits
    } catch (error) {
      console.error("Failed to check limits:", error)
      return null
    }
  }, [tenantId, convex, showToast])

  return {
    trackUsage,
    checkLimits,
  }
}
