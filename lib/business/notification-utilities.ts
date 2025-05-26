import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Specialized utilities for auto-detailing notifications
 */

/**
 * Send booking confirmation notification
 * @param tenantId - The tenant ID
 * @param bookingId - The booking ID
 * @returns Result of the notification operation
 */
export async function sendBookingConfirmation(tenantId: Id<"tenants">, bookingId: Id<"bookings">) {
  try {
    await convex.mutation(api.notifications.sendBookingConfirmation, {
      tenantId,
      bookingId,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error sending booking confirmation:", error)
    return {
      success: false,
      message: "Failed to send booking confirmation",
    }
  }
}

/**
 * Send booking reminder notification
 * @param tenantId - The tenant ID
 * @param bookingId - The booking ID
 * @returns Result of the notification operation
 */
export async function sendBookingReminder(tenantId: Id<"tenants">, bookingId: Id<"bookings">) {
  try {
    await convex.mutation(api.notifications.sendBookingReminder, {
      tenantId,
      bookingId,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error sending booking reminder:", error)
    return {
      success: false,
      message: "Failed to send booking reminder",
    }
  }
}

/**
 * Send booking cancellation notification
 * @param tenantId - The tenant ID
 * @param bookingId - The booking ID
 * @returns Result of the notification operation
 */
export async function sendBookingCancellation(tenantId: Id<"tenants">, bookingId: Id<"bookings">) {
  try {
    await convex.mutation(api.notifications.sendBookingCancellation, {
      tenantId,
      bookingId,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error sending booking cancellation:", error)
    return {
      success: false,
      message: "Failed to send booking cancellation",
    }
  }
}

/**
 * Get notification preferences for a client
 * @param tenantId - The tenant ID
 * @param clientId - The client ID
 * @returns Client notification preferences
 */
export async function getClientNotificationPreferences(tenantId: Id<"tenants">, clientId: Id<"clients">) {
  try {
    return await convex.query(api.notificationPreferences.getClientPreferences, {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error fetching client notification preferences:", error)
    return {
      email: true,
      sms: false,
      reminders: true,
      marketing: false,
    }
  }
}

/**
 * Update notification preferences for a client
 * @param tenantId - The tenant ID
 * @param clientId - The client ID
 * @param preferences - The notification preferences
 * @returns Result of the update operation
 */
export async function updateClientNotificationPreferences(
  tenantId: Id<"tenants">,
  clientId: Id<"clients">,
  preferences: {
    email?: boolean
    sms?: boolean
    reminders?: boolean
    marketing?: boolean
  },
) {
  try {
    await convex.mutation(api.notificationPreferences.updateClientPreferences, {
      tenantId,
      clientId,
      preferences,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating client notification preferences:", error)
    return {
      success: false,
      message: "Failed to update notification preferences",
    }
  }
}
