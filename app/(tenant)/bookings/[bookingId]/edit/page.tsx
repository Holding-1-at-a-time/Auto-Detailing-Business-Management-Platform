import { notFound } from "next/navigation"
import { requireTenantAccess } from "@/lib/auth"
import { getBookingById } from "@/lib/actions/booking-actions"
import { getClients } from "@/lib/actions/client-actions"
import { getServiceDetails } from "@/convex/scheduling"
import { EnhancedBookingFormWithAi } from "@/components/bookings/enhanced-booking-form-with-ai"

interface EditBookingPageProps {
  params: { tenant: string; bookingId: string }
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  // Fetch booking details
  const booking = await getBookingById(params.tenant, params.bookingId)

  if (!booking) {
    notFound()
  }

  // Fetch clients and services
  const [clients, services] = await Promise.all([getClients(params.tenant), getServiceDetails()])

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Booking</h1>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EnhancedBookingFormWithAi
            tenantId={params.tenant}
            clients={clients}
            services={services.map((s) => s.name)}
            booking={booking}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  )
}
