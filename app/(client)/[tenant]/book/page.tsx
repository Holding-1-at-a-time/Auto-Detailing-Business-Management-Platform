import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTenantBySlug } from "@/lib/actions/tenant-actions"
import { ClientBookingCalendar } from "@/components/client/client-booking-calendar"
import { ClientBookingLayout } from "@/components/client/client-booking-layout"
import { Skeleton } from "@/components/ui/skeleton"

interface BookingPageProps {
  params: { tenant: string }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const tenant = await getTenantBySlug(params.tenant)

  if (!tenant) {
    notFound()
  }

  return (
    <ClientBookingLayout tenant={tenant}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground mb-8">Schedule your auto detailing service with {tenant.name}</p>

        <Suspense fallback={<BookingCalendarSkeleton />}>
          <ClientBookingCalendar tenantId={tenant.id} />
        </Suspense>
      </div>
    </ClientBookingLayout>
  )
}

function BookingCalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
}
