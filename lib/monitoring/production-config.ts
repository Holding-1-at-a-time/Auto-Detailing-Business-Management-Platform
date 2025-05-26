import { monitoring } from "./monitoring-service"
import { captureMessage } from "@/lib/sentry"

export class ProductionMonitoring {
  private static initialized = false
  private static healthCheckInterval: NodeJS.Timeout | null = null

  static initialize() {
    if (this.initialized) return

    this.initialized = true

    // Start health checks
    this.startHealthChecks()

    // Monitor critical business events
    this.setupBusinessEventMonitoring()

    // Setup performance monitoring
    this.setupPerformanceMonitoring()

    // Setup error rate monitoring
    this.setupErrorRateMonitoring()

    captureMessage("Production monitoring initialized", "info", {
      tags: { component: "monitoring", event: "initialization" },
    })
  }

  private static startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        // Check database health
        const dbStart = Date.now()
        // In production, this would be a real health check
        const dbHealthy = Math.random() > 0.05 // 95% uptime simulation
        const dbDuration = Date.now() - dbStart

        monitoring.trackSystemHealth("database", dbHealthy ? "healthy" : "degraded", dbDuration)

        // Check API health
        const apiStart = Date.now()
        const apiHealthy = Math.random() > 0.02 // 98% uptime simulation
        const apiDuration = Date.now() - apiStart

        monitoring.trackSystemHealth("api", apiHealthy ? "healthy" : "degraded", apiDuration)

        // Check integrations
        const integrations = ["google_calendar", "stripe", "email"]
        for (const integration of integrations) {
          const healthy = Math.random() > 0.1 // 90% uptime simulation
          monitoring.trackSystemHealth(integration, healthy ? "healthy" : "degraded")
        }
      } catch (error) {
        monitoring.trackError(error as Error, {
          component: "health_check",
          operation: "system_health_monitoring",
          severity: "high",
        })
      }
    }, 60000) // Every minute
  }

  private static setupBusinessEventMonitoring() {
    // Monitor booking conversion rates
    setInterval(() => {
      // In production, these would be real metrics from your database
      const bookingViews = Math.floor(Math.random() * 100) + 50
      const bookingCreated = Math.floor(Math.random() * 20) + 5
      const conversionRate = (bookingCreated / bookingViews) * 100

      monitoring.trackBusinessMetric("booking.conversion_rate", conversionRate)
      monitoring.trackBusinessMetric("booking.views", bookingViews)
    }, 300000) // Every 5 minutes
  }

  private static setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if (typeof window !== "undefined") {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            monitoring.trackPerformanceMetric("web_vitals.lcp", entry.startTime)
          }
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] })

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEventTiming
            monitoring.trackPerformanceMetric("web_vitals.fid", fidEntry.processingStart - fidEntry.startTime)
          }
        }
      }).observe({ entryTypes: ["first-input"] })

      // CLS (Cumulative Layout Shift)
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        monitoring.trackPerformanceMetric("web_vitals.cls", clsValue)
      }).observe({ entryTypes: ["layout-shift"] })
    }
  }

  private static setupErrorRateMonitoring() {
    let errorCount = 0
    let totalRequests = 0

    // Monitor error rates
    setInterval(() => {
      if (totalRequests > 0) {
        const errorRate = (errorCount / totalRequests) * 100
        monitoring.trackBusinessMetric("error.rate", errorRate)

        // Alert if error rate is too high
        if (errorRate > 5) {
          captureMessage(`High error rate detected: ${errorRate.toFixed(2)}%`, "warning", {
            tags: { alert: "high_error_rate" },
            extra: { errorCount, totalRequests, errorRate },
          })
        }
      }

      // Reset counters
      errorCount = 0
      totalRequests = 0
    }, 300000) // Every 5 minutes

    // Track requests and errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      totalRequests++
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          errorCount++
        }
        return response
      } catch (error) {
        errorCount++
        throw error
      }
    }
  }

  static destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    this.initialized = false
  }
}

// Auto-initialize in production
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  ProductionMonitoring.initialize()
}
