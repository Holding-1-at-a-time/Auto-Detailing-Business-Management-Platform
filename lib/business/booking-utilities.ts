import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"
import { calculateServiceDuration } from "./service-utilities"

/**
 * Specialized utilities for auto-detailing booking management
 */

/**
 * Calculate available time slots based on business hours and existing bookings
 * @param tenantId - The tenant ID
 * @param date - The date to check
 * @param serviceName - The service name (to determine duration)
 * @returns Array of available time slots
 */
export async function getAvailableTimeSlots(tenantId: Id<"tenants">, date: string, serviceName: string) {
  try {
    // This calls the existing function in your Convex backend
    return await convex.query(api.scheduling.getAvailableTimeSlots, {
      tenantId,
      date,
      service: serviceName,
    })
  } catch (error) {
    console.error("Error fetching available time slots:", error)
    return []
  }
}

/**
 * Check if a booking time conflicts with existing bookings
 * @param tenantId - The tenant ID
 * @param dateTime - The proposed booking time
 * @param serviceName - The service name
 * @param vehicleSize - The vehicle size
 * @param excludeBookingId - Optional booking ID to exclude from conflict check
 * @returns Object indicating if there's a conflict
 */
export async function checkBookingConflict(
  tenantId: Id<"tenants">,
  dateTime: number,
  serviceName: string,
  vehicleSize: "small" | "medium" | "large" = "medium",
  excludeBookingId?: Id<"bookings">,
) {
  try {
    // Calculate service duration based on service and vehicle size
    const durationMinutes = calculateServiceDuration(serviceName, vehicleSize)

    // Calculate end time
    const endTime = dateTime + durationMinutes * 60 * 1000

    // Check for conflicts
    const result = await convex.query(api.bookings.checkTimeConflicts, {
      tenantId,
      startTime: dateTime,
      endTime,
      excludeBookingId,
    })

    return result
  } catch (error) {
    console.error("Error checking booking conflict:", error)
    return { hasConflict: true, message: "Unable to verify availability" }
  }
}

/**
 * Get upcoming bookings for a specific date
 * @param tenantId - The tenant ID
 * @param date - The date to check
 * @returns Array of bookings for the date
 */
export async function getBookingsForDate(tenantId: Id<"tenants">, date: Date) {
  try {
    // Set time to beginning of day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    // Set time to end of day
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get bookings for the date range
    const bookings = await convex.query(api.bookings.getBookingsByDateRange, {
      tenantId,
      startDate: startOfDay.getTime(),
      endDate: endOfDay.getTime(),
    })

    return bookings
  } catch (error) {
    console.error("Error fetching bookings for date:", error)
    return []
  }
}

/**
 * Calculate booking statistics for a date range
 * @param tenantId - The tenant ID
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Booking statistics
 */
export async function getBookingStatistics(tenantId: Id<"tenants">, startDate: Date, endDate: Date) {
  try {
    return await convex.query(api.dashboard.getBookingStatistics, {
      tenantId,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    })
  } catch (error) {
    console.error("Error fetching booking statistics:", error)
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      revenue: 0,
    }
  }
}

/**
 * Get next available booking slot
 * @param tenantId - The tenant ID
 * @param serviceName - The service name
 * @returns Next available booking time or null
 */
export async function getNextAvailableSlot(tenantId: Id<"tenants">, serviceName: string) {
  try {
    // Start checking from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check for the next 14 days
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)

      const dateString = checkDate.toISOString().split("T")[0]

      const availableSlots = await getAvailableTimeSlots(tenantId, dateString, serviceName)

      // Return first available slot if any
      if (availableSlots.length > 0 && availableSlots[0].available) {
        const [hours, minutes] = availableSlots[0].time.split(":").map(Number)

        const slotDate = new Date(checkDate)
        slotDate.setHours(hours, minutes, 0, 0)

        return slotDate.getTime()
      }
    }

    // No available slots found
    return null
  } catch (error) {
    console.error("Error finding next available slot:", error)
    return null
  }
}
