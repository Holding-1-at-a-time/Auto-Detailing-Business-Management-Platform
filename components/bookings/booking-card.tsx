import type { Booking } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

interface BookingCardProps {
  booking: Booking
  clientName?: string
}

export function BookingCard({ booking, clientName }: BookingCardProps) {
  const bookingDate = new Date(booking.dateTime)

  const getStatusColor = (status: string) => {
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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{booking.service}</h3>
            {clientName && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                {clientName}
              </div>
            )}
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              {formatDateTime(bookingDate)}
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>

        {booking.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{booking.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
