"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Loader2, CheckCircle } from "lucide-react"

interface BookingFormProps {
  tenantId: Id<"tenants">
  service: string
  date: Date
  time: string
  onClose: () => void
  onComplete: () => void
}

export function BookingForm({ tenantId, service, date, time, onClose, onComplete }: BookingFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const createClient = useMutation(api.scheduling.createClientInternal)
  const createBooking = useMutation(api.scheduling.createBookingInternal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // First, create the client
      const clientId = await createClient({
        tenantId,
        name,
        email,
        phone,
        notes: `Created via public booking form`,
      })

      // Then create the booking
      const [hours, minutes] = time.split(":").map(Number)
      const bookingDate = new Date(date)
      bookingDate.setHours(hours, minutes, 0, 0)

      await createBooking({
        tenantId,
        clientId,
        dateTime: bookingDate.getTime(),
        service,
        notes,
      })

      setIsSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error("Error creating booking:", error)
      // Handle error appropriately
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Booking</DialogTitle>
              <DialogDescription>
                {service} on {format(date, "EEEE, MMMM d, yyyy")} at {time}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or vehicle details..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground">
              We've sent a confirmation email to {email}. We look forward to seeing you!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
