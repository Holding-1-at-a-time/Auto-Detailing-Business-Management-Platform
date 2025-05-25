"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClients } from "@/hooks/useClients"
import { useTenant } from "@/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormError } from "@/components/common/form-error"
import type { Booking, ServiceType } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

interface BookingFormProps {
  initialData?: Partial<Booking>
  onSubmit: (data: Partial<Booking>) => Promise<void>
}

export function BookingForm({ initialData, onSubmit }: BookingFormProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const { clients, isLoading: isLoadingClients } = useClients()

  const [clientId, setClientId] = useState(initialData?.clientId || "")
  const [service, setService] = useState<ServiceType>((initialData?.service as ServiceType) || "wax")
  const [date, setDate] = useState<Date | undefined>(initialData?.dateTime ? new Date(initialData.dateTime) : undefined)
  const [time, setTime] = useState(initialData?.dateTime ? format(new Date(initialData.dateTime), "HH:mm") : "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const serviceOptions: { value: ServiceType; label: string }[] = [
    { value: "wax", label: "Wax" },
    { value: "polish", label: "Polish" },
    { value: "interior", label: "Interior Cleaning" },
    { value: "ceramic", label: "Ceramic Coating" },
    { value: "full-detail", label: "Full Detail" },
  ]

  const timeOptions = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!clientId) {
      newErrors.clientId = "Please select a client"
    }

    if (!service) {
      newErrors.service = "Please select a service"
    }

    if (!date) {
      newErrors.date = "Please select a date"
    }

    if (!time) {
      newErrors.time = "Please select a time"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const dateTime = date ? new Date(date) : new Date()
      if (time) {
        const [hours, minutes] = time.split(":").map(Number)
        dateTime.setHours(hours, minutes, 0, 0)
      }

      await onSubmit({
        clientId,
        service,
        dateTime,
        notes,
      })

      router.push(`/${tenantId}/bookings`)
    } catch (error) {
      console.error("Error submitting booking:", error)
      setErrors({
        form: "An error occurred while saving the booking. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="client" className="block text-sm font-medium mb-1">
            Client *
          </label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="client">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingClients ? (
                <SelectItem value="loading" disabled>
                  Loading clients...
                </SelectItem>
              ) : clients && clients.length > 0 ? (
                clients
                  .filter((client) => !client.isDeleted)
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="empty" disabled>
                  No clients found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.clientId && <FormError message={errors.clientId} />}
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium mb-1">
            Service *
          </label>
          <Select value={service} onValueChange={(value) => setService(value as ServiceType)}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service && <FormError message={errors.service} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            {errors.date && <FormError message={errors.date} />}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Time *
            </label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time">
                  {time ? (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  ) : (
                    "Select a time"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((timeOption) => (
                  <SelectItem key={timeOption} value={timeOption}>
                    {timeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && <FormError message={errors.time} />}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <Textarea
            id="notes"
            placeholder="Add any additional details about this booking"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {errors.form && <FormError message={errors.form} />}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${tenantId}/bookings`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Booking" : "Create Booking"}
        </Button>
      </div>
    </form>
  )
}
