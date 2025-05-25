"use client"

import { useClients } from "@/hooks/useClients"
import { useBookings } from "@/hooks/useBookings"
import { ClientCard } from "./client-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useTenant } from "@/hooks/useTenant"

export function ClientList() {
  const { tenantId } = useTenant()
  const [searchQuery, setSearchQuery] = useState("")
  const { clients, isLoading: isLoadingClients } = useClients()
  const { bookings, isLoading: isLoadingBookings } = useBookings()

  // Get last booking date for each client
  const getLastBookingDate = (clientId: string) => {
    if (!bookings) return null

    const clientBookings = bookings.filter((booking) => booking.clientId === clientId)
    if (clientBookings.length === 0) return null

    // Sort by date (newest first)
    const sortedBookings = [...clientBookings].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    })

    return new Date(sortedBookings[0].dateTime)
  }

  // Filter clients by search query
  const filteredClients = clients?.filter((client) => {
    if (client.isDeleted) return false

    const searchLower = searchQuery.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href={`/${tenantId}/clients/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </Link>
      </div>

      {isLoadingClients || isLoadingBookings ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border animate-pulse bg-muted"></div>
          ))}
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Link key={client.id} href={`/${tenantId}/clients/${client.id}`}>
              <ClientCard client={client} lastBookingDate={getLastBookingDate(client.id)} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No clients found</p>
          <Link href={`/${tenantId}/clients/new`}>
            <Button variant="outline" className="mt-4">
              Add your first client
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
