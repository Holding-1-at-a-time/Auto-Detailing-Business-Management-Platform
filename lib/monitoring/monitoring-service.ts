import * as Sentry from "@sentry/nextjs"
import { captureException, captureMessage, recordMetric } from "@/lib/sentry"

export class MonitoringService {
  private static instance: MonitoringService
  private metricsBuffer: Array<{ name: string; value: number; tags?: Record<string, string> }> = []
  private flushInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startMetricsFlush()
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Business Metrics
  trackBookingCreated(tenantId: string, serviceType: string, value: number) {
    this.addMetric("booking.created", 1, { tenantId, serviceType })
    this.addMetric("booking.value", value, { tenantId, serviceType })

    Sentry.addBreadcrumb({
      message: "Booking created",
      category: "business",
      level: "info",
      data: { tenantId, serviceType, value },
    })
  }

  trackClientCreated(tenantId: string) {
    this.addMetric("client.created", 1, { tenantId })

    Sentry.addBreadcrumb({
      message: "Client created",
      category: "business",
      level: "info",
      data: { tenantId },
    })
  }

  trackPaymentProcessed(tenantId: string, amount: number, status: "success" | "failed") {
    this.addMetric("payment.processed", 1, { tenantId, status })
    this.addMetric("payment.amount", amount, { tenantId, status })

    Sentry.addBreadcrumb({
      message: `Payment ${status}`,
      category: "business",
      level: status === "success" ? "info" : "warning",
      data: { tenantId, amount, status },
    })
  }

  trackIntegrationEvent(tenantId: string, integration: string, event: string, success: boolean) {
    this.addMetric("integration.event", 1, { tenantId, integration, event, success: success.toString() })

    Sentry.addBreadcrumb({
      message: `Integration ${integration} ${event}`,
      category: "integration",
      level: success ? "info" : "error",
      data: { tenantId, integration, event, success },
    })
  }

  // Performance Metrics
  trackPerformanceMetric(metric: string, value: number, tags?: Record<string, string>) {
    this.addMetric(`performance.${metric}`, value, tags)

    // Alert on poor performance
    if (metric === "web_vitals.lcp" && value > 2500) {
      captureMessage(`Poor LCP performance: ${value}ms`, "warning", {
        tags: { performance: "lcp", ...tags },
      })
    }

    if (metric === "web_vitals.fid" && value > 100) {
      captureMessage(`Poor FID performance: ${value}ms`, "warning", {
        tags: { performance: "fid", ...tags },
      })
    }

    if (metric === "web_vitals.cls" && value > 0.1) {
      captureMessage(`Poor CLS performance: ${value}`, "warning", {
        tags: { performance: "cls", ...tags },
      })
    }
  }

  // Business Metrics
  trackBusinessMetric(metric: string, value: number, tags?: Record<string, string>) {
    this.addMetric(`business.${metric}`, value, tags)

    Sentry.addBreadcrumb({
      message: `Business metric: ${metric} = ${value}`,
      category: "business",
      level: "info",
      data: { metric, value, ...tags },
    })
  }

  trackApiCall(endpoint: string, method: string, duration: number, status: number, tenantId?: string) {
    this.addMetric("api.call", 1, { endpoint, method, status: status.toString(), tenantId })
    this.addMetric("api.duration", duration, { endpoint, method, tenantId })

    if (status >= 400) {
      this.addMetric("api.error", 1, { endpoint, method, status: status.toString(), tenantId })
    }
  }

  trackDatabaseQuery(operation: string, duration: number, success: boolean, tenantId?: string) {
    this.addMetric("db.query", 1, { operation, success: success.toString(), tenantId })
    this.addMetric("db.duration", duration, { operation, tenantId })

    if (!success) {
      this.addMetric("db.error", 1, { operation, tenantId })
    }
  }

  trackComponentRender(component: string, duration: number, tenantId?: string) {
    this.addMetric("component.render", 1, { component, tenantId })
    this.addMetric("component.render_time", duration, { component, tenantId })
  }

  // Error Tracking
  trackError(
    error: Error,
    context: {
      component?: string
      operation?: string
      tenantId?: string
      userId?: string
      severity?: "low" | "medium" | "high" | "critical"
    },
  ) {
    const tags = {
      component: context.component || "unknown",
      operation: context.operation || "unknown",
      severity: context.severity || "medium",
    }

    if (context.tenantId) tags.tenantId = context.tenantId
    if (context.userId) tags.userId = context.userId

    captureException(error, { tags })

    this.addMetric("error.occurred", 1, tags)
  }

  // User Behavior
  trackUserAction(action: string, tenantId: string, userId?: string, metadata?: Record<string, any>) {
    this.addMetric("user.action", 1, { action, tenantId })

    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: "user",
      level: "info",
      data: { action, tenantId, userId, ...metadata },
    })
  }

  trackFeatureUsage(feature: string, tenantId: string, userId?: string) {
    this.addMetric("feature.usage", 1, { feature, tenantId })

    Sentry.addBreadcrumb({
      message: `Feature used: ${feature}`,
      category: "feature",
      level: "info",
      data: { feature, tenantId, userId },
    })
  }

  // System Health
  trackSystemHealth(component: string, status: "healthy" | "degraded" | "down", responseTime?: number) {
    this.addMetric("system.health", 1, { component, status })

    if (responseTime) {
      this.addMetric("system.response_time", responseTime, { component })
    }

    if (status !== "healthy") {
      captureMessage(`System component ${component} is ${status}`, "warning", {
        tags: { component, status },
        extra: { responseTime },
      })
    }
  }

  // Private methods
  private addMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metricsBuffer.push({ name, value, tags })

    // Immediate flush for critical metrics
    if (name.includes("error") || name.includes("payment")) {
      this.flushMetrics()
    }
  }

  private startMetricsFlush() {
    this.flushInterval = setInterval(() => {
      this.flushMetrics()
    }, 10000) // Flush every 10 seconds
  }

  private flushMetrics() {
    if (this.metricsBuffer.length === 0) return

    const metrics = [...this.metricsBuffer]
    this.metricsBuffer = []

    metrics.forEach(({ name, value, tags }) => {
      recordMetric(name, value, tags)
    })
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flushMetrics()
  }
}

export const monitoring = MonitoringService.getInstance()
