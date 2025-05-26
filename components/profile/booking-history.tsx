"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Car, MapPin } from "lucide-react"

type Booking = {
  id: string
  date: string
  time: string
  service: string
  vehicle: string
  location: string
  status: "upcoming" | "completed" | "cancelled"
}

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      date: "2025-06-15",
      time: "10:00 AM",
      service: "Full Detail",
      vehicle: "2020 Toyota Camry",
      location: "Main Location",
      status: "upcoming",
    },
    {
      id: "2",
      date: "2025-05-20",
      time: "2:00 PM",
      service: "Exterior Wash",
      vehicle: "2020 Toyota Camry",
      location: "Main Location",
      status: "completed",
    },
    {
      id: "3",
      date: "2025-04-10",
      time: "11:30 AM",
      service: "Interior Cleaning",
      vehicle: "2020 Toyota Camry",
      location: "Main Location",
      status: "cancelled",
    },
  ])

  const cancelBooking = (id: string) => {
    setBookings(bookings.map((booking) => (booking.id === id ? { ...booking, status: "cancelled" as const } : booking)))
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600"
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "cancelled":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Bookings</h2>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {["upcoming", "completed", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {bookings.filter((b) => b.status === status).length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No {status} bookings</p>
              </div>
            ) : (
              bookings
                .filter((booking) => booking.status === status)
                .map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{booking.service}</CardTitle>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {booking.time}
                        </div>
                        <div className="flex items-center">
                          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                          {booking.vehicle}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {booking.location}
                        </div>
                      </div>
                    </CardContent>
                    {booking.status === "upcoming" && (
                      <CardFooter className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => cancelBooking(booking.id)}>
                          Cancel Booking
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
