"use server"

import { revalidatePath } from "next/cache"
import { ConvexError } from "convex/values"
import { api } from "@/lib/convex/convex-client"
import { requireTenantAccess } from "@/lib/auth"
import { bookingFormSchema } from "@/components/bookings/booking-form-validation"

export async function getBookingById(tenantId: string, bookingId: string) {
  try {
    await requireTenantAccess(tenantId)

    const booking = await api.query.bookings.getBookingById({
      tenantId,
      bookingId,
    })

    return booking
  } catch (error) {
    console.error("Error fetching booking:", error)
    if (error instanceof ConvexError) {
      throw new Error(`Failed to fetch booking: ${error.message}`)
    }
    throw new Error("Failed to fetch booking details")
  }
}

export async function getBookings(
  tenantId: string,
  filters: {
    upcoming?: boolean
    clientId?: string
    status?: string
    limit?: number
  } = {},
) {
  try {
    await requireTenantAccess(tenantId)

    const bookings = await api.query.bookings.getBookings({
      tenantId,
      ...filters,
    })

    return bookings
  } catch (error) {
    console.error("Error fetching bookings:", error)
    if (error instanceof ConvexError) {
      throw new Error(`Failed to fetch bookings: ${error.message}`)
    }
    throw new Error("Failed to fetch bookings")
  }
}

export async function createBooking(tenantId: string, formData: FormData) {
  try {
    await requireTenantAccess(tenantId)

    // Parse and validate form data
    const rawData = {
      clientId: formData.get("clientId") as string,
      dateTime: Number(formData.get("dateTime")),
      service: formData.get("service") as string,
      notes: formData.get("notes") as string,
    }

    const validationResult = bookingFormSchema.safeParse(rawData)

    if (!validationResult.success) {
      throw new Error(`Invalid booking data: ${JSON.stringify(validationResult.error.format())}`)
    }

    // Check for time conflicts
    // This would be implemented in a real application

    // Create the booking
    const bookingId = await api.mutation.bookings.createBooking({
      tenantId,
      clientId: validationResult.data.clientId,
      dateTime: validationResult.data.dateTime,
      service: validationResult.data.service,
      notes: validationResult.data.notes,
    })

    // Revalidate related paths
    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/dashboard`)

    return { id: bookingId }
  } catch (error) {
    console.error("Error creating booking:", error)
    if (error instanceof ConvexError) {
      throw new Error(`Failed to create booking: ${error.message}`)
    }
    throw error
  }
}

export async function updateBooking(tenantId: string, bookingId: string, formData: FormData) {
  try {
    await requireTenantAccess(tenantId)

    // Parse and validate form data
    const rawData = {
      clientId: formData.get("clientId") as string,
      dateTime: Number(formData.get("dateTime")),
      service: formData.get("service") as string,
      notes: formData.get("notes") as string,
      status: formData.get("status") as "scheduled" | "completed" | "cancelled",
    }

    const validationResult = bookingFormSchema.safeParse(rawData)

    if (!validationResult.success) {
      throw new Error(`Invalid booking data: ${JSON.stringify(validationResult.error.format())}`)
    }

    // Check for time conflicts
    // This would be implemented in a real application

    // Update the booking
    await api.mutation.bookings.updateBooking({
      tenantId,
      bookingId,
      ...validationResult.data,
    })

    // Revalidate related paths
    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/bookings/${bookingId}`)
    revalidatePath(`/${tenantId}/dashboard`)

    return { success: true }
  } catch (error) {
    console.error("Error updating booking:", error)
    if (error instanceof ConvexError) {
      throw new Error(`Failed to update booking: ${error.message}`)
    }
    throw error
  }
}

export async function deleteBooking(tenantId: string, bookingId: string) {
  try {
    await requireTenantAccess(tenantId)

    // Delete (cancel) the booking
    await api.mutation.bookings.deleteBooking({
      tenantId,
      bookingId,
    })

    // Revalidate related paths
    revalidatePath(`/${tenantId}/bookings`)
    revalidatePath(`/${tenantId}/dashboard`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting booking:", error)
    if (error instanceof ConvexError) {
      throw new Error(`Failed to delete booking: ${error.message}`)
    }
    throw error
  }
}
