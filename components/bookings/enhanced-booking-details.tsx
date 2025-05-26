"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarX, Clock, Edit, Loader2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/components/common/api-error"
import { useTenant } from "@/hooks/useTenant"
import { deleteBooking } from "@/lib/actions/booking-actions"
import { formatBookingDate, formatBookingTime } from "@/lib/utils/booking-utils"
import type { Booking } from "@/lib/types"

interface EnhancedBookingDetailsProps {
  booking: Booking
}

export function EnhancedBookingDetails({ booking }: EnhancedBookingDetailsProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      await deleteBooking(tenantId, booking.id)

      router.push(`/${tenantId}/bookings`)
      router.refresh()
    } catch (err) {
      console.error("Error deleting booking:", err)
      setError(err instanceof Error ? err.message : "Failed to delete booking. Please try again.")
      setIsDeleting(false)
    }
  }

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {error && <ApiError title="Booking Error" error={error} reset={() => setError(null)} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{booking.service}</CardTitle>
            <CardDescription>Booking #{booking.id.substring(0, 8)}</CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatBookingDate(booking.dateTime)} at {formatBookingTime(booking.dateTime)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{booking.client?.name || "Unknown Client"}</span>
              </div>
              {booking.client?.email && (
                <div className="text-sm text-muted-foreground pl-6">{booking.client.email}</div>
              )}
              {booking.client?.phone && (
                <div className="text-sm text-muted-foreground pl-6">{booking.client.phone}</div>
              )}
            </div>
          </div>

          <Separator />

          {booking.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/${tenantId}/bookings`)}>
            Back to Bookings
          </Button>

          <div className="flex gap-2">
            {booking.status === "scheduled" && (
              <>
                <Button variant="outline" onClick={() => router.push(`/${tenantId}/bookings/${booking.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <CalendarX className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
