"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/components/common/api-error"
import { useTenant } from "@/hooks/useTenant"
import { useBookings } from "@/hooks/useBookings"
import { formatBookingDate, formatBookingTime } from "@/lib/utils/booking-utils"

interface BookingListProps {
  status?: "scheduled" | "completed" | "cancelled"
  clientId?: string
  limit?: number
}

export function BookingList({ status, clientId, limit }: BookingListProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [error, setError] = useState<string | null>(null)

  const { bookings, isLoading } = useBookings({
    status,
    clientId,
    limit,
  })

  // Handle view booking details
  const handleViewBooking = (bookingId: string) => {
    router.push(`/${tenantId}/bookings/${bookingId}`)
  }

  // Get status badge color
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ApiError title="Error loading bookings" error={error} reset={() => setError(null)} />
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-center text-muted-foreground">No bookings found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/${tenantId}/bookings/new`)}>
            Create a new booking
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{booking.service}</CardTitle>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              {formatBookingDate(booking.dateTime)} at {formatBookingTime(booking.dateTime)}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm">{booking.client?.name || "Unknown Client"}</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewBooking(booking.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
