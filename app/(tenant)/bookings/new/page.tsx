"use client"

import { requireTenantAccess } from "@/lib/auth"
import { BookingForm } from "@/components/bookings/booking-form"
import { createBooking } from "@/lib/actions/booking-actions"

interface NewBookingPageProps {
  params: { tenant: string }
}

export default async function NewBookingPage({ params }: NewBookingPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Booking</h1>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <BookingForm
            onSubmit={async (data) => {
              "use server"
              await createBooking(params.tenant, data)
            }}
          />
        </div>
      </div>
    </div>
  )
}
