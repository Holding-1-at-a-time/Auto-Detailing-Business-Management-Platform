"use client"

import { useBookings } from "@/hooks/useBookings"
import { useClients } from "@/hooks/useClients"
import { BookingCard } from "./booking-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useTenant } from "@/hooks/useTenant"

interface BookingListProps {
  status?: "scheduled" | "completed" | "cancelled"
}

export function BookingList({ status }: BookingListProps) {
  const { tenantId } = useTenant()
  const [searchQuery, setSearchQuery] = useState("")
  const { bookings, isLoading: isLoadingBookings } = useBookings({ status })
  const { clients, isLoading: isLoadingClients } = useClients()

  // Get client names for bookings
  const getClientName = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId)
    return client?.name || "Unknown Client"
  }

  // Filter bookings by search query
  const filteredBookings = bookings?.filter((booking) => {
    const clientName = getClientName(booking.clientId)
    const searchLower = searchQuery.toLowerCase()

    return booking.service.toLowerCase().includes(searchLower) || clientName.toLowerCase().includes(searchLower)
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href={`/${tenantId}/bookings/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      {isLoadingBookings || isLoadingClients ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border animate-pulse bg-muted"></div>
          ))}
        </div>
      ) : filteredBookings && filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Link key={booking.id} href={`/${tenantId}/bookings/${booking.id}`}>
              <BookingCard booking={booking} clientName={getClientName(booking.clientId)} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found</p>
          <Link href={`/${tenantId}/bookings/new`}>
            <Button variant="outline" className="mt-4">
              Create your first booking
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
