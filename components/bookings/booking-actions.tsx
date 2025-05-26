"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Printer, X, Loader2 } from "lucide-react"

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
import { useToast } from "@/components/ui/use-toast"
import { useTenant } from "@/hooks/useTenant"
import { deleteBooking } from "@/lib/actions/booking-actions"
import type { Booking } from "@/lib/types"

interface BookingActionsProps {
  booking: Booking
  onReschedule?: () => void
}

export function BookingActions({ booking, onReschedule }: BookingActionsProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const { toast } = useToast()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true)
      await deleteBooking(tenantId, booking.id)

      toast({
        title: "Booking cancelled",
        description: "The booking has been successfully cancelled.",
      })

      router.push(`/${tenantId}/bookings`)
      router.refresh()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handlePrintInvoice = async () => {
    try {
      setIsPrinting(true)

      // In a real application, this would generate and download a PDF
      // For now, we'll just open the print dialog
      window.print()

      toast({
        title: "Invoice printed",
        description: "The invoice has been sent to your printer.",
      })
    } catch (error) {
      console.error("Error printing invoice:", error)
      toast({
        title: "Error",
        description: "Failed to print the invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule()
    } else {
      router.push(`/${tenantId}/bookings/${booking.id}/edit`)
    }
  }

  // Don't show actions for cancelled bookings
  if (booking.status === "cancelled") {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {booking.status === "scheduled" && (
        <>
          <Button variant="outline" size="sm" onClick={handleReschedule}>
            <Calendar className="mr-2 h-4 w-4" />
            Reschedule
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <X className="mr-2 h-4 w-4" />
                Cancel Booking
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone. The client will be
                  notified of the cancellation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      <Button variant="outline" size="sm" onClick={handlePrintInvoice} disabled={isPrinting}>
        {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
        Print Invoice
      </Button>
    </div>
  )
}
