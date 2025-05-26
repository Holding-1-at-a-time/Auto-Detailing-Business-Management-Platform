import { monitoring } from "./monitoring-service"
import { captureMessage } from "@/lib/sentry"

export class MonitoringTest {
  static async runAllTests(): Promise<{
    passed: number
    failed: number
    results: Array<{ test: string; passed: boolean; error?: string }>
  }> {
    const tests = [
      { name: "Business Metrics", test: this.testBusinessMetrics },
      { name: "Performance Tracking", test: this.testPerformanceTracking },
      { name: "Error Tracking", test: this.testErrorTracking },
      { name: "User Behavior", test: this.testUserBehavior },
      { name: "System Health", test: this.testSystemHealth },
      { name: "Integration Events", test: this.testIntegrationEvents },
    ]

    const results = []
    let passed = 0
    let failed = 0

    for (const { name, test } of tests) {
      try {
        await test()
        results.push({ test: name, passed: true })
        passed++
      } catch (error) {
        results.push({ test: name, passed: false, error: error instanceof Error ? error.message : "Unknown error" })
        failed++
      }
    }

    return { passed, failed, results }
  }

  private static async testBusinessMetrics() {
    // Test booking tracking
    monitoring.trackBookingCreated("test-tenant", "premium-wash", 150)
    monitoring.trackClientCreated("test-tenant")
    monitoring.trackPaymentProcessed("test-tenant", 150, "success")

    // Simulate some time passing
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private static async testPerformanceTracking() {
    // Test API call tracking
    monitoring.trackApiCall("/api/bookings", "POST", 250, 201, "test-tenant")
    monitoring.trackApiCall("/api/clients", "GET", 150, 200, "test-tenant")

    // Test database query tracking
    monitoring.trackDatabaseQuery("createBooking", 50, true, "test-tenant")
    monitoring.trackDatabaseQuery("getClients", 30, true, "test-tenant")

    // Test component render tracking
    monitoring.trackComponentRender("BookingForm", 25, "test-tenant")

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private static async testErrorTracking() {
    // Test error tracking
    const testError = new Error("Test error for monitoring")
    monitoring.trackError(testError, {
      component: "TestComponent",
      operation: "testOperation",
      tenantId: "test-tenant",
      severity: "low",
    })

    // Test Sentry integration
    captureMessage("Test monitoring message", "info", {
      tags: { test: "true" },
      tenantId: "test-tenant",
    })

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private static async testUserBehavior() {
    // Test user action tracking
    monitoring.trackUserAction("create_booking", "test-tenant", "test-user", {
      serviceType: "premium-wash",
      duration: 60,
    })

    // Test feature usage tracking
    monitoring.trackFeatureUsage("booking_agent", "test-tenant", "test-user")
    monitoring.trackFeatureUsage("calendar_integration", "test-tenant", "test-user")

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private static async testSystemHealth() {
    // Test system health tracking
    monitoring.trackSystemHealth("database", "healthy", 25)
    monitoring.trackSystemHealth("api", "healthy", 150)
    monitoring.trackSystemHealth("google_calendar", "degraded", 500)

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private static async testIntegrationEvents() {
    // Test integration event tracking
    monitoring.trackIntegrationEvent("test-tenant", "google_calendar", "sync", true)
    monitoring.trackIntegrationEvent("test-tenant", "stripe", "payment", true)
    monitoring.trackIntegrationEvent("test-tenant", "email", "send", false)

    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
