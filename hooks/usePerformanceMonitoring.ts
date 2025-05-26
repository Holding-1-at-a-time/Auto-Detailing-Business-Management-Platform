"use client"

import { useEffect, useCallback, useRef } from "react"
import * as Sentry from "@sentry/nextjs"
import { recordMetric } from "@/lib/sentry"

export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = useRef<number>(Date.now())
  const mountTime = useRef<number | null>(null)

  useEffect(() => {
    mountTime.current = Date.now()
    const renderTime = mountTime.current - renderStartTime.current

    // Record component render time
    recordMetric("component.render_time", renderTime, {
      component: componentName,
    })

    // Add breadcrumb for component mount
    Sentry.addBreadcrumb({
      message: `Component ${componentName} mounted`,
      category: "ui",
      level: "info",
      data: { component: componentName, renderTime },
    })

    return () => {
      if (mountTime.current) {
        const lifeTime = Date.now() - mountTime.current
        recordMetric("component.lifetime", lifeTime, {
          component: componentName,
        })
      }
    }
  }, [componentName])

  const trackUserInteraction = useCallback(
    (interaction: string, data?: Record<string, any>) => {
      Sentry.addBreadcrumb({
        message: `User interaction: ${interaction} in ${componentName}`,
        category: "ui",
        level: "info",
        data: { component: componentName, interaction, ...data },
      })

      recordMetric("user.interaction", 1, {
        component: componentName,
        interaction,
      })
    },
    [componentName],
  )

  const measureOperation = useCallback(
    <T,>(operationName: string, operation: () => Promise<T>): Promise<T> => {
      const startTime = Date.now()

      return operation().then(
        (result) => {
          const duration = Date.now() - startTime
          recordMetric("operation.duration", duration, {
            component: componentName,
            operation: operationName,
            status: "success",
          })
          return result
        },
        (error) => {
          const duration = Date.now() - startTime
          recordMetric("operation.duration", duration, {
            component: componentName,
            operation: operationName,
            status: "error",
          })
          throw error
        },
      )
    },
    [componentName],
  )

  return {
    trackUserInteraction,
    measureOperation,
  }
}
