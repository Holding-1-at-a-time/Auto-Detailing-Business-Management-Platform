"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTenant } from "@/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Clock, User, FileText, Tag, AlertTriangle } from "lucide-react"
import { BookingForm } from "./booking-form"
import { updateBooking, deleteBooking } from "@/lib/actions/booking-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Booking } from "@/lib/types"

interface BookingDetailsProps {
  booking: Booking & { client: { name: string; email?: string; phone?: string } }
}

export function BookingDetails({ booking }: BookingDetailsProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [isEditing, setIsEditing] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const handleCancelBooking = async () => {
    try {
      await deleteBooking(tenantId, booking.id)
      router.push(`/${tenantId}/bookings`)
    } catch (error) {
      console.error("Error cancelling booking:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            initialData={booking}
            onSubmit={async (data) => {
              await updateBooking(tenantId, booking.id, data)
              setIsEditing(false)
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Booking #{booking.id.substring(0, 8)}</CardTitle>
        <Badge className={getStatusBadgeColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p>
                  {format(new Date(booking.dateTime), "PPPP")}
                  <br />
                  {format(new Date(booking.dateTime), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Client</h3>
                <p>
                  {booking.client.name}
                  {booking.client.email && (
                    <>
                      <br />
                      {booking.client.email}
                    </>
                  )}
                  {booking.client.phone && (
                    <>
                      <br />
                      {booking.client.phone}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Service</h3>
                <p>{booking.service}</p>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Notes</h3>
                  <p>{booking.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Created</h3>
                <p>{format(new Date(booking.createdAt), "PPP")}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {booking.status === "scheduled" && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Cancel Booking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Booking</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                    No, Keep Booking
                  </Button>
                  <Button variant="destructive" onClick={handleCancelBooking}>
                    Yes, Cancel Booking
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => router.push(`/${tenantId}/bookings`)}>
            Back to Bookings
          </Button>
          {booking.status === "scheduled" && <Button onClick={() => setIsEditing(true)}>Edit Booking</Button>}
        </div>
      </CardFooter>
    </Card>
  )
}
