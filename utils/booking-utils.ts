/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 09:41:53
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { api } from "@/lib/convex/convex-client"
import { getServiceDuration } from "@/components/bookings/booking-form-validation"

/**
 * Checks if a proposed booking time conflicts with existing bookings
 */
export async function checkBookingTimeConflict(
  tenantId: string,
  dateTime: number,
  service: string,
  excludeBookingId?: string,
): Promise<{ hasConflict: boolean; message?: string }> {
  try {
    // Get the service duration
    const serviceDuration = getServiceDuration(service)

    // Calculate the end time of the proposed booking
    const startTime = new Date(dateTime)
    const endTime = new Date(dateTime + serviceDuration * 60 * 1000)

    // Format date for query
    const date = startTime.toISOString().split("T")[0]

    // Get available time slots for the date
    const timeSlots = await api.query.scheduling.getAvailableTimeSlots({
      tenantId,
      date,
      service,
    })

    // Check if the proposed time is available
    const proposedTimeString = `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`

    const isAvailable = timeSlots.some((slot) => slot.time === proposedTimeString && slot.available)

    if (!isAvailable) {
      return {
        hasConflict: true,
        message: "The selected time slot is not available. Please choose another time.",
      }
    }

    return { hasConflict: false }
  } catch (error) {
    console.error("Error checking booking time conflict:", error)
    return {
      hasConflict: true,
      message: "Unable to verify time slot availability. Please try again.",
    }
  }
}

/**
 * Formats a date for display
 */
export function formatBookingDate(dateTime: number | Date): string {
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formats a time for display
 */
export function formatBookingTime(dateTime: number | Date): string {
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}