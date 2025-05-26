import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Specialized utilities for Google Calendar integration
 */

/**
 * Check if Google Calendar is connected for a tenant
 * @param tenantId - The tenant ID
 * @returns Boolean indicating if Google Calendar is connected
 */
export async function isGoogleCalendarConnected(tenantId: Id<"tenants">) {
  try {
    const integration = await convex.query(api.integrations.getIntegrationStatus, {
      tenantId,
      integrationType: "googleCalendar",
    })

    return integration?.connected || false
  } catch (error) {
    console.error("Error checking Google Calendar connection:", error)
    return false
  }
}

/**
 * Sync a booking with Google Calendar
 * @param tenantId - The tenant ID
 * @param bookingId - The booking ID
 * @returns Result of the sync operation
 */
export async function syncBookingWithGoogleCalendar(tenantId: Id<"tenants">, bookingId: Id<"bookings">) {
  try {
    // Check if Google Calendar is connected
    const isConnected = await isGoogleCalendarConnected(tenantId)

    if (!isConnected) {
      return {
        success: false,
        message: "Google Calendar is not connected",
      }
    }

    // Sync the booking
    const result = await convex.mutation(api.googleCalendar.syncBookingToCalendar, {
      tenantId,
      bookingId,
    })

    return {
      success: true,
      googleEventId: result.googleEventId,
    }
  } catch (error) {
    console.error("Error syncing booking with Google Calendar:", error)
    return {
      success: false,
      message: "Failed to sync booking with Google Calendar",
    }
  }
}

/**
 * Get Google Calendar events for a date range
 * @param tenantId - The tenant ID
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of calendar events
 */
export async function getGoogleCalendarEvents(tenantId: Id<"tenants">, startDate: Date, endDate: Date) {
  try {
    // Check if Google Calendar is connected
    const isConnected = await isGoogleCalendarConnected(tenantId)

    if (!isConnected) {
      return []
    }

    // Get calendar events
    return await convex.query(api.googleCalendar.getCalendarEvents, {
      tenantId,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    })
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error)
    return []
  }
}

/**
 * Delete a booking from Google Calendar
 * @param tenantId - The tenant ID
 * @param bookingId - The booking ID
 * @returns Result of the delete operation
 */
export async function deleteBookingFromGoogleCalendar(tenantId: Id<"tenants">, bookingId: Id<"bookings">) {
  try {
    // Check if Google Calendar is connected
    const isConnected = await isGoogleCalendarConnected(tenantId)

    if (!isConnected) {
      return {
        success: false,
        message: "Google Calendar is not connected",
      }
    }

    // Delete the booking from Google Calendar
    await convex.mutation(api.googleCalendar.deleteCalendarEvent, {
      tenantId,
      bookingId,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting booking from Google Calendar:", error)
    return {
      success: false,
      message: "Failed to delete booking from Google Calendar",
    }
  }
}
