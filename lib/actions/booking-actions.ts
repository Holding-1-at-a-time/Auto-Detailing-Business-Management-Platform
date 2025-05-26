"use server"

import { convex } from "@/lib/convex/convex-client"
import type { Booking } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function getBookingById(tenantId: string, bookingId: string) {
  try {
    return await convex.query("bookings.getBookingById", {
      tenantId,
      bookingId,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

export async function createBooking(tenantId: string, data: Partial<Booking>) {
  try {
    // Convert date object to timestamp if it exists
    const dateTime = data.dateTime instanceof Date ? data.dateTime.getTime() : undefined

    const result = await convex.mutation("bookings.createBooking", {
      tenantId,
      ...data,
      dateTime,
    })

    revalidatePath(`/${tenantId}/bookings`)
    return result
  } catch (error) {
    console.error("Error creating booking:", error)
    throw new Error("Failed to create booking")
  }
}

export async function updateBooking(tenantId: string, bookingId: string, data: Partial<Booking>) {
  try {
    // Convert date object to timestamp if it exists
    const dateTime = data.dateTime instanceof Date ? data.dateTime.getTime() : undefined

    const result = await convex.mutation("bookings.updateBooking", {
      tenantId,
      bookingId,
      ...data,
      dateTime,
    })

    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/bookings/${bookingId}`)
    return result
  } catch (error) {
    console.error("Error updating booking:", error)
    throw new Error("Failed to update booking")
  }
}

export async function deleteBooking(tenantId: string, bookingId: string) {
  try {
    const result = await convex.mutation("bookings.deleteBooking", {
      tenantId,
      bookingId,
    })

    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/bookings/${bookingId}`)
    return result
  } catch (error) {
    console.error("Error deleting booking:", error)
    throw new Error("Failed to delete booking")
  }
}
