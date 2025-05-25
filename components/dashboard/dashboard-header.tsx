"use client"

import { useBookings } from "@/hooks/useBookings"
import { useClients } from "@/hooks/useClients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, CheckCircle } from "lucide-react"

interface DashboardHeaderProps {
  tenantId: string
}

export function DashboardHeader({ tenantId }: DashboardHeaderProps) {
  const { bookings, isLoading: isLoadingBookings } = useBookings({
    upcoming: true,
    status: "scheduled",
  })

  const { clients, isLoading: isLoadingClients } = useClients()

  // Calculate today's bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayBookings = bookings?.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate >= today && bookingDate < tomorrow
  })

  // Calculate upcoming 7 days bookings
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingBookings = bookings?.filter((booking) => {
    const bookingDate = new Date(booking.dateTime)
    return bookingDate >= today && bookingDate < nextWeek
  })

  // Calculate new clients in last 30 days
  const lastMonth = new Date(today)
  lastMonth.setDate(lastMonth.getDate() - 30)

  const newClients = clients?.filter((client) => {
    const clientDate = new Date(client.createdAt)
    return clientDate >= lastMonth
  })

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoadingBookings ? "..." : todayBookings?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Bookings (7 days)</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoadingBookings ? "..." : upcomingBookings?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Clients (30 days)</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoadingClients ? "..." : newClients?.length || 0}</div>
        </CardContent>
      </Card>
    </div>
  )
}
