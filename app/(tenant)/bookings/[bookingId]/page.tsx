import { requireTenantAccess } from "@/lib/auth"
import { getBookingById } from "@/lib/actions/booking-actions"
import { BookingDetails } from "@/components/bookings/booking-details"
import { notFound } from "next/navigation"

interface BookingDetailsPageProps {
  params: { tenant: string; bookingId: string }
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  const booking = await getBookingById(params.tenant, params.bookingId)

  if (!booking) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>
      <BookingDetails booking={booking} />
    </div>
  )
}
