import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/actions/tenant-actions"
import { BookingCalendar } from "@/components/public/booking-calendar"
import { BookingHeader } from "@/components/public/booking-header"

interface BookingPageProps {
  params: { tenantSlug: string }
}

export default async function PublicBookingPage({ params }: BookingPageProps) {
  const tenant = await getTenantBySlug(params.tenantSlug)

  if (!tenant) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BookingHeader tenant={tenant} />
      <main className="container mx-auto px-4 py-8">
        <BookingCalendar tenantId={tenant.id} tenantName={tenant.name} />
      </main>
    </div>
  )
}
