"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import * as Sentry from "@sentry/nextjs"
import { captureException, captureMessage, recordMetric } from "@/lib/sentry"
import { useTenant } from "./useTenant"

export function useSentryMonitoring() {
  const pathname = usePathname()
  const { tenantId } = useTenant()

  // Track page views
  useEffect(() => {
    if (pathname) {
      Sentry.addBreadcrumb({
        message: `Navigated to ${pathname}`,
        category: "navigation",
        level: "info",
        data: { pathname, tenantId },
      })

      recordMetric("page.view", 1, {
        pathname,
        tenantId: tenantId || "unknown",
      })
    }
  }, [pathname, tenantId])

  // Track user actions
  const trackAction = useCallback(
    (action: string, data?: Record<string, any>) => {
      Sentry.addBreadcrumb({
        message: `User action: ${action}`,
        category: "user",
        level: "info",
        data: { action, ...data, tenantId },
      })

      recordMetric("user.action", 1, {
        action,
        tenantId: tenantId || "unknown",
      })
    },
    [tenantId],
  )

  // Track API calls
  const trackApiCall = useCallback(
    (endpoint: string, method: string, status: number, duration?: number) => {
      Sentry.addBreadcrumb({
        message: `API call: ${method} ${endpoint}`,
        category: "http",
        level: status >= 400 ? "error" : "info",
        data: { endpoint, method, status, duration, tenantId },
      })

      recordMetric("api.call", 1, {
        endpoint,
        method,
        status: status.toString(),
        tenantId: tenantId || "unknown",
      })

      if (duration) {
        recordMetric("api.duration", duration, {
          endpoint,
          method,
          tenantId: tenantId || "unknown",
        })
      }
    },
    [tenantId],
  )

  // Track business metrics
  const trackBusinessMetric = useCallback(
    (metric: string, value: number, tags?: Record<string, string>) => {
      recordMetric(`business.${metric}`, value, {
        ...tags,
        tenantId: tenantId || "unknown",
      })
    },
    [tenantId],
  )

  return {
    trackAction,
    trackApiCall,
    trackBusinessMetric,
    captureException: (error: Error, context?: any) => captureException(error, { ...context, tenantId }),
    captureMessage: (message: string, level?: any, context?: any) =>
      captureMessage(message, level, { ...context, tenantId }),
  }
}
