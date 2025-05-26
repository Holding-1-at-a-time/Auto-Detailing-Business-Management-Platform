import { requireTenantAccess } from "@/lib/auth"
import { BookingForm } from "@/components/bookings/booking-form"

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
          <BookingForm tenantId={params.tenant} />
        </div>
      </div>
    </div>
  )
}
