import { requireTenantAccess } from "@/lib/auth"
import { BookingList } from "@/components/bookings/booking-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BookingsPageProps {
  params: { tenant: string }
}

export default async function BookingsPage({ params }: BookingsPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bookings</h1>

      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled" className="mt-4">
          <BookingList status="scheduled" />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <BookingList status="completed" />
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          <BookingList status="cancelled" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
