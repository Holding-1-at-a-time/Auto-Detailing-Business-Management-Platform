import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireTenantAccess } from "@/lib/auth"
import { getBookingById, updateBooking, deleteBooking } from "@/lib/actions/booking-actions"

// Validation schema for booking updates
const updateBookingSchema = z.object({
  clientId: z.string().optional(),
  dateTime: z.number().optional(),
  service: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { tenant: string; bookingId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    const booking = await getBookingById(params.tenant, params.bookingId)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking details" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tenant: string; bookingId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    // Get the current booking to check if it exists
    const existingBooking = await getBookingById(params.tenant, params.bookingId)

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Parse and validate the request body
    const body = await request.json()
    const validationResult = updateBookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    // Check for date/time conflicts if updating dateTime
    if (validationResult.data.dateTime) {
      // This would be implemented in a real application
      // const conflicts = await checkForTimeConflicts(params.tenant, validationResult.data.dateTime, params.bookingId)
      // if (conflicts) {
      //   return NextResponse.json(
      //     { error: "The selected time slot is no longer available" },
      //     { status: 409 }
      //   )
      // }
    }

    // Update the booking
    const updatedBookingId = await updateBooking(params.tenant, params.bookingId, validationResult.data)

    return NextResponse.json({ id: updatedBookingId })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tenant: string; bookingId: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    // Get the current booking to check if it exists
    const existingBooking = await getBookingById(params.tenant, params.bookingId)

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Delete (cancel) the booking
    await deleteBooking(params.tenant, params.bookingId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
