"use server"

import { convex } from "@/lib/convex/convex-client"
import { revalidatePath } from "next/cache"

export async function getClientBookingById(tenantId: string, bookingId: string) {
  try {
    return await convex.query("clientBookings.getClientBookingById", {
      tenantId,
      bookingId,
    })
  } catch (error) {
    console.error("Error fetching client booking:", error)
    return null
  }
}

export async function createClientBooking(
  tenantId: string,
  data: {
    clientName: string
    clientEmail: string
    clientPhone: string
    service: string
    dateTime: Date
    notes?: string
    vehicleType?: string
  },
) {
  try {
    // Convert date object to timestamp if it exists
    const dateTime = data.dateTime instanceof Date ? data.dateTime.getTime() : undefined

    const result = await convex.mutation("clientBookings.createClientBooking", {
      tenantId,
      ...data,
      dateTime,
    })

    revalidatePath(`/${tenantId}/booking-confirmation/${result}`)
    return result
  } catch (error) {
    console.error("Error creating client booking:", error)
    throw new Error("Failed to create booking")
  }
}

export async function cancelClientBooking(tenantId: string, bookingId: string, reason?: string) {
  try {
    const result = await convex.mutation("clientBookings.cancelClientBooking", {
      tenantId,
      bookingId,
      reason,
    })

    revalidatePath(`/${tenantId}/booking-confirmation/${bookingId}`)
    return result
  } catch (error) {
    console.error("Error canceling client booking:", error)
    throw new Error("Failed to cancel booking")
  }
}
