"use client"

import { ProductionMonitoring } from "./production-config"
import { monitoring } from "./monitoring-service"
import { captureMessage } from "@/lib/sentry"

export function initializeMonitoring() {
  try {
    // Initialize production monitoring
    ProductionMonitoring.initialize()

    // Track initialization
    monitoring.trackUserAction("monitoring_initialized", "system")

    captureMessage("Monitoring system fully initialized", "info", {
      tags: {
        component: "monitoring",
        event: "full_initialization",
        environment: process.env.NODE_ENV || "development",
      },
    })

    console.log("✅ Monitoring system initialized successfully")
  } catch (error) {
    monitoring.trackError(error as Error, {
      component: "monitoring",
      operation: "initialization",
      severity: "critical",
    })

    console.error("❌ Failed to initialize monitoring system:", error)
  }
}

// Auto-initialize on client side
if (typeof window !== "undefined") {
  // Wait for the app to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMonitoring)
  } else {
    initializeMonitoring()
  }
}
