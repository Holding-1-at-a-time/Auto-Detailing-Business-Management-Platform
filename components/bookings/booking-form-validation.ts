import { z } from "zod"

// Define the validation schema for booking form
export const bookingFormSchema = z.object({
  clientId: z.string({
    required_error: "Please select a client",
  }),
  dateTime: z
    .number({
      required_error: "Please select a date and time",
    })
    .refine(
      (value) => {
        const date = new Date(value)
        return !isNaN(date.getTime())
      },
      {
        message: "Invalid date and time",
      },
    )
    .refine(
      (value) => {
        const date = new Date(value)
        return date.getTime() > Date.now()
      },
      {
        message: "Booking must be in the future",
      },
    ),
  service: z.string({
    required_error: "Please select a service",
  }),
  notes: z.string().optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>

// Function to check for time conflicts
export async function checkTimeConflicts(
  tenantId: string,
  dateTime: number,
  serviceDuration: number,
  excludeBookingId?: string,
): Promise<boolean> {
  try {
    // This would call a server action or API endpoint to check for conflicts
    // For now, we'll return false (no conflicts) as a placeholder
    return false
  } catch (error) {
    console.error("Error checking time conflicts:", error)
    return true // Assume conflict on error to be safe
  }
}

// Get service duration in minutes
export function getServiceDuration(service: string): number {
  switch (service) {
    case "Basic Wash":
      return 30
    case "Interior Detailing":
    case "Exterior Detailing":
      return 60
    case "Full Detailing":
    case "Ceramic Coating":
      return 120
    case "Paint Correction":
      return 180
    default:
      return 60 // Default duration
  }
}
