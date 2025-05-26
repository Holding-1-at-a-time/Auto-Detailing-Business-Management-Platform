import { notFound } from "next/navigation"
import Link from "next/link"
import { getTenantBySlug } from "@/lib/actions/tenant-actions"
import { getClientBookingById } from "@/lib/actions/client-booking-actions"
import { ClientBookingLayout } from "@/components/client/client-booking-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { CalendarCheck, MapPin, Clock, Car, CheckCircle2 } from "lucide-react"

interface BookingConfirmationPageProps {
  params: { tenant: string; bookingId: string }
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const tenant = await getTenantBySlug(params.tenant)

  if (!tenant) {
    notFound()
  }

  const booking = await getClientBookingById(tenant.id, params.bookingId)

  if (!booking) {
    notFound()
  }

  const bookingDate = new Date(booking.dateTime)

  return (
    <ClientBookingLayout tenant={tenant}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-2">Your appointment has been scheduled successfully</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Reference: {booking.id.substring(0, 8).toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CalendarCheck className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{format(bookingDate, "EEEE, MMMM d, yyyy")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p>{format(bookingDate, "h:mm a")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Service</p>
                  <p>{booking.service}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Car className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Vehicle</p>
                  <p>{booking.vehicleType || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium">Customer Information</p>
              <p>{booking.clientName}</p>
              <p>{booking.clientEmail}</p>
              <p>{booking.clientPhone}</p>
            </div>

            {booking.notes && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground">A confirmation email has been sent to {booking.clientEmail}</p>
            <div className="flex gap-4 w-full">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/${tenant.id}/book`}>Book Another Appointment</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/${tenant.id}`}>Return to Home</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ClientBookingLayout>
  )
}
