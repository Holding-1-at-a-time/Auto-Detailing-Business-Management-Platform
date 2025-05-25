"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTenant } from "@/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Mail, Phone, FileText, Calendar, AlertTriangle } from "lucide-react"
import { ClientForm } from "./client-form"
import { updateClient, deleteClient } from "@/lib/actions/client-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBookings } from "@/hooks/useBookings"
import type { Client } from "@/lib/types"

interface ClientDetailsProps {
  client: Client
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { bookings, isLoading: isLoadingBookings } = useBookings({
    clientId: client.id,
    limit: 5,
  })

  const handleDeleteClient = async () => {
    try {
      await deleteClient(tenantId, client.id)
      router.push(`/${tenantId}/clients`)
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm
            initialData={client}
            onSubmit={async (data) => {
              await updateClient(tenantId, client.id, data)
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{client.name}</CardTitle>
          {client.isDeleted && <Badge variant="destructive">Deleted</Badge>}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p>{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p>{client.phone}</p>
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p>{client.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Created</h3>
                  <p>{format(new Date(client.createdAt), "PPP")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {!client.isDeleted && (
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Client</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Are you sure you want to delete this client? This action cannot be undone.</p>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteClient}>
                      Delete Client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => router.push(`/${tenantId}/clients`)}>
              Back to Clients
            </Button>
            {!client.isDeleted && <Button onClick={() => setIsEditing(true)}>Edit Client</Button>}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="text-center py-4">Loading bookings...</div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/${tenantId}/bookings/${booking.id}`)}
                >
                  <div>
                    <p className="font-medium">{booking.service}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.dateTime), "PPP")} at {format(new Date(booking.dateTime), "h:mm a")}
                    </p>
                  </div>
                  <Badge
                    className={
                      booking.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : booking.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No bookings found for this client.</div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/${tenantId}/bookings/new?clientId=${client.id}`)}
            disabled={client.isDeleted}
          >
            Create New Booking
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
