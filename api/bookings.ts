import { convex } from "@/lib/convex/convex-client"
import type { Booking } from "@/lib/types"

/**
 * Get all bookings with optional filters
 */
export async function getBookings(
  tenantId: string,
  filters?: {
    upcoming?: boolean
    clientId?: string
    limit?: number
    status?: string
    startDate?: Date
    endDate?: Date
    search?: string
  },
) {
  try {
    return await convex.query("bookings.getBookings", {
      tenantId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    throw new Error("Failed to fetch bookings")
  }
}

/**
 * Get a single booking by ID
 */
export async function getBooking(tenantId: string, bookingId: string) {
  try {
    return await convex.query("bookings.getBookingById", {
      tenantId,
      bookingId,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    throw new Error("Failed to fetch booking")
  }
}

/**
 * Create a new booking
 */
export async function createBooking(tenantId: string, data: Omit<Booking, "id">) {
  try {
    return await convex.mutation("bookings.createBooking", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    throw new Error("Failed to create booking")
  }
}

/**
 * Update an existing booking
 */
export async function updateBooking(tenantId: string, bookingId: string, data: Partial<Booking>) {
  try {
    return await convex.mutation("bookings.updateBooking", {
      tenantId,
      bookingId,
      ...data,
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    throw new Error("Failed to update booking")
  }
}

/**
 * Delete a booking (soft delete)
 */
export async function deleteBooking(tenantId: string, bookingId: string) {
  try {
    return await convex.mutation("bookings.deleteBooking", {
      tenantId,
      bookingId,
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    throw new Error("Failed to delete booking")
  }
}
