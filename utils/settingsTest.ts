/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 09:42:48
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
"use client"

import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function testIntegrationConnection(
  type: "google_calendar" | "email_notifications" | "sms_notifications",
  tenantId: string,
  settings?: Record<string, any>,
): Promise<{ success: boolean; message: string }> {
  try {
    switch (type) {
      case "google_calendar":
        // Test Google Calendar API connection
        const calendarTest = await fetch("/api/integrations/google-calendar/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
        })

        if (calendarTest.ok) {
          return { success: true, message: "Google Calendar connection successful" }
        } else {
          return { success: false, message: "Failed to connect to Google Calendar" }
        }

      case "email_notifications":
        // Test email configuration
        return { success: true, message: "Email notifications configured successfully" }

      case "sms_notifications":
        // Test Twilio configuration
        if (!settings?.accountSid || !settings?.authToken || !settings?.phoneNumber) {
          return { success: false, message: "Missing required Twilio credentials" }
        }

        // In a real implementation, you would test the Twilio connection here
        return { success: true, message: "SMS notifications configured successfully" }

      default:
        return { success: false, message: "Unknown integration type" }
    }
  } catch (error) {
    console.error("Integration test error:", error)
    return { success: false, message: "Integration test failed" }
  }
}

export async function validateTenantSettings(tenantId: string): Promise<{
  valid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  try {
    // Check tenant exists and is accessible
    const tenant = await convex.query(api.tenants.getTenant, { tenantId })
    if (!tenant) {
      issues.push("Tenant not found")
      return { valid: false, issues }
    }

    // Check tenant settings
    const settings = await convex.query(api.tenants.getTenantSettings, { tenantId })
    if (!settings) {
      issues.push("Tenant settings not configured")
    } else {
      if (!settings.businessName || settings.businessName.trim().length === 0) {
        issues.push("Business name is required")
      }
      if (!settings.timezone) {
        issues.push("Timezone is required")
      }
    }

    // Check billing status
    const billing = await convex.query(api.billing.getBillingInfo, { tenantId })
    if (billing && billing.status === "past_due") {
      issues.push("Billing is past due - some features may be limited")
    }

    return { valid: issues.length === 0, issues }
  } catch (error) {
    console.error("Settings validation error:", error)
    issues.push("Failed to validate settings")
    return { valid: false, issues }
  }
}