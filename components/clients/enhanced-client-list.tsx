"use client"

import { useState, useCallback } from "react"
import { useClients } from "@/hooks/useClients"
import { useBookings } from "@/hooks/useBookings"
import { EnhancedClientCard } from "./enhanced-client-card"
import { SearchBar } from "./search-bar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useTenant } from "@/hooks/useTenant"

export function EnhancedClientList() {
  const { tenantId } = useTenant()
  const [searchQuery, setSearchQuery] = useState("")

  const { clients, isLoading: isLoadingClients } = useClients({
    search: searchQuery,
  })

  const { bookings, isLoading: isLoadingBookings } = useBookings()

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

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

  // Filter out deleted clients
  const activeClients = clients?.filter((client) => !client.isDeleted)

  // Error state
  if (!isLoadingClients && clients === undefined) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load clients. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name, email, or phone..."
          className="w-full sm:w-96"
        />
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
            <div key={i} className="h-48 rounded-lg border animate-pulse bg-muted"></div>
          ))}
        </div>
      ) : activeClients && activeClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeClients.map((client) => (
            <Link key={client.id} href={`/${tenantId}/clients/${client.id}`} className="block">
              <EnhancedClientCard client={client} tenantId={tenantId} lastBookingDate={getLastBookingDate(client.id)} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No clients found</p>
          <p className="mt-2 text-muted-foreground">
            {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first client"}
          </p>
          <Link href={`/${tenantId}/clients/new`}>
            <Button variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add your first client
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
