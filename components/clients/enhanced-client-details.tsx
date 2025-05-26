"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Client } from "@/lib/types"
import { EnhancedClientCard } from "./enhanced-client-card"
import { BookingHistoryList } from "./booking-history-list"
import { ClientNotes } from "./client-notes"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EnhancedClientDetailsProps {
  client: Client
  tenantId: string
}

export function EnhancedClientDetails({ client, tenantId }: EnhancedClientDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/${tenantId}/clients/${client.id}/route`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete client")
      }

      router.push(`/${tenantId}/clients`)
      router.refresh()
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("Failed to delete client. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${tenantId}/clients`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Link href={`/${tenantId}/clients/${client.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive the client and remove them from your active client list. Their booking history will
                  be preserved for your records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Client"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <EnhancedClientCard client={client} tenantId={tenantId} />
          <ClientNotes tenantId={tenantId} clientId={client.id} initialNotes={client.notes} />
        </div>
        <div>
          <BookingHistoryList tenantId={tenantId} clientId={client.id} />
        </div>
      </div>
    </div>
  )
}
