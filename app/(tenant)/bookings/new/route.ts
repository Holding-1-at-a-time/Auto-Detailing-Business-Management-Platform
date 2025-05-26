import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireTenantAccess } from "@/lib/auth"
import { createBooking } from "@/lib/actions/booking-actions"
import { parseBookingRequest } from "@/lib/ai/booking-parser"

// Validation schema for new booking
const createBookingSchema = z.object({
  clientId: z.string(),
  dateTime: z.number(),
  service: z.string(),
  notes: z.string().optional(),
  useAiParsing: z.boolean().optional(),
  aiInput: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: { tenant: string } }) {
  try {
    // Server-side auth check
    await requireTenantAccess(params.tenant)

    // Parse request body
    const body = await request.json()

    // If AI parsing is requested
    if (body.useAiParsing && body.aiInput) {
      try {
        const parsedBooking = await parseBookingRequest(body.aiInput)

        // Merge parsed data with existing data
        body.service = parsedBooking.service || body.service
        body.notes = parsedBooking.notes || body.notes

        // Convert parsed date and time to timestamp
        if (parsedBooking.date && parsedBooking.time) {
          const [year, month, day] = parsedBooking.date.split("-").map(Number)
          const [hours, minutes] = parsedBooking.time.split(":").map(Number)
          const dateTime = new Date(year, month - 1, day, hours, minutes)
          body.dateTime = dateTime.getTime()
        }
      } catch (aiError) {
        console.error("AI parsing error:", aiError)
        // Continue with manual data if AI parsing fails
      }
    }

    // Validate the booking data
    const validationResult = createBookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    // Create FormData for server action
    const formData = new FormData()
    formData.append("clientId", validationResult.data.clientId)
    formData.append("dateTime", validationResult.data.dateTime.toString())
    formData.append("service", validationResult.data.service)
    formData.append("notes", validationResult.data.notes || "")

    // Create the booking
    const result = await createBooking(params.tenant, formData)

    return NextResponse.json({ success: true, bookingId: result.id })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 },
    )
  }
}
