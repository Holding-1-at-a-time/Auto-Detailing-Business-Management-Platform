"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ApiError } from "@/components/common/api-error"
import { bookingFormSchema, type BookingFormValues } from "./booking-form-validation"
import { checkBookingTimeConflict } from "@/lib/utils/booking-utils"
import { useTenant } from "@/hooks/useTenant"
import { createBooking, updateBooking } from "@/lib/actions/booking-actions"
import type { Booking } from "@/lib/types"

interface EnhancedBookingFormProps {
  clients: { id: string; name: string }[]
  services: string[]
  booking?: Partial<Booking>
  isEdit?: boolean
}

export function EnhancedBookingForm({ clients, services, booking, isEdit = false }: EnhancedBookingFormProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values or existing booking data
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: booking?.clientId || "",
      dateTime: booking?.dateTime ? Number(booking.dateTime) : undefined,
      service: booking?.service || "",
      notes: booking?.notes || "",
    },
  })

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Check for time conflicts
      const conflictCheck = await checkBookingTimeConflict(
        tenantId,
        data.dateTime,
        data.service,
        isEdit ? booking?.id : undefined,
      )

      if (conflictCheck.hasConflict) {
        setError(conflictCheck.message || "Time conflict detected. Please choose another time.")
        setIsSubmitting(false)
        return
      }

      // Create FormData object
      const formData = new FormData()
      formData.append("clientId", data.clientId)
      formData.append("dateTime", data.dateTime.toString())
      formData.append("service", data.service)
      formData.append("notes", data.notes || "")

      if (isEdit && booking?.id) {
        // Update existing booking
        await updateBooking(tenantId, booking.id, formData)
        router.push(`/${tenantId}/bookings/${booking.id}`)
      } else {
        // Create new booking
        const result = await createBooking(tenantId, formData)
        router.push(`/${tenantId}/bookings/${result.id}`)
      }

      router.refresh()
    } catch (err) {
      console.error("Error submitting booking:", err)
      setError(err instanceof Error ? err.message : "Failed to save booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <ApiError title="Booking Error" error={error} reset={() => setError(null)} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select an existing client or{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/${tenantId}/clients/new`)}>
                    add a new client
                  </Button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : <span>Select date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Preserve the time if already set
                            const currentDate = field.value ? new Date(field.value) : new Date()
                            date.setHours(currentDate.getHours())
                            date.setMinutes(currentDate.getMinutes())
                            field.onChange(date.getTime())
                          }
                        }}
                        disabled={(date) => {
                          // Disable dates in the past
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => {
                      const [hours, minutes] = time.split(":").map(Number)
                      const date = field.value ? new Date(field.value) : new Date()
                      date.setHours(hours, minutes, 0, 0)
                      const timestamp = date.getTime()

                      return (
                        <Button
                          key={time}
                          type="button"
                          variant={field.value === timestamp ? "default" : "outline"}
                          className="h-10"
                          onClick={() => field.onChange(timestamp)}
                          disabled={isSubmitting}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any special instructions or notes here"
                    className="resize-none"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Booking" : "Create Booking"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
