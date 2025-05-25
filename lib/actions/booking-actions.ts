"use server"

import { convex } from "@/lib/convex/convex-client"
import type { Booking } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function createBooking(tenantId: string, data: Partial<Booking>) {
  try {
    const result = await convex.mutation("bookings.createBooking", {
      tenantId,
      ...data,
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
    const result = await convex.mutation("bookings.updateBooking", {
      tenantId,
      id: bookingId,
      ...data,
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
    const result = await convex.mutation("bookings.updateBooking", {
      tenantId,
      id: bookingId,
      status: "cancelled",
    })

    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/bookings/${bookingId}`)
    return result
  } catch (error) {
    console.error("Error deleting booking:", error)
    throw new Error("Failed to delete booking")
  }
}
