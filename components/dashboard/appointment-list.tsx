"use client"

import { useBookings } from "@/hooks/useBookings"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Calendar, ChevronRight } from "lucide-react"

interface AppointmentListProps {
  tenantId: string
  limit?: number
}

export function AppointmentList({ tenantId, limit = 5 }: AppointmentListProps) {
  const { bookings, isLoading } = useBookings({
    upcoming: true,
    status: "scheduled",
    limit,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No upcoming appointments</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Link key={booking.id} href={`/${tenantId}/bookings/${booking.id}`} className="block">
          <Card className="hover:bg-accent transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.service}</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(new Date(booking.dateTime))}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
