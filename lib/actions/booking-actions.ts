"use server"

import { redirect } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { fetchMutation } from "convex/nextjs"

export interface CreateBookingData {
  clientName: string
  clientEmail: string
  clientPhone: string
  vehicle: string
  service: string
  scheduledDate: Date
  scheduledTime: string
  estimatedDuration: number
  price: number
  notes?: string
}

export async function createBooking(tenantId: string, data: CreateBookingData) {
  "use server"

  try {
    // Create the booking using Convex mutation
    const bookingId = await fetchMutation(api.bookings.create, {
      tenantId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      vehicle: data.vehicle,
      service: data.service,
      scheduledDate: data.scheduledDate.toISOString(),
      scheduledTime: data.scheduledTime,
      estimatedDuration: data.estimatedDuration,
      price: data.price,
      notes: data.notes,
      status: "scheduled",
    })

    return { success: true, bookingId }
  } catch (error) {
    console.error("Failed to create booking:", error)
    throw new Error("Failed to create booking")
  }
}

export async function createBookingAction(tenantId: string, data: CreateBookingData) {
  "use server"

  const result = await createBooking(tenantId, data)

  if (result.success) {
    redirect(`/${tenantId}/bookings`)
  }
}

export async function updateBooking(bookingId: string, data: Partial<CreateBookingData>) {
  "use server"

  try {
    await fetchMutation(api.bookings.update, {
      bookingId,
      ...data,
      scheduledDate: data.scheduledDate?.toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to update booking:", error)
    throw new Error("Failed to update booking")
  }
}

export async function cancelBooking(bookingId: string) {
  "use server"

  try {
    await fetchMutation(api.bookings.cancel, {
      bookingId,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to cancel booking:", error)
    throw new Error("Failed to cancel booking")
  }
}

export async function completeBooking(bookingId: string) {
  "use server"

  try {
    await fetchMutation(api.bookings.complete, {
      bookingId,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to complete booking:", error)
    throw new Error("Failed to complete booking")
  }
}
