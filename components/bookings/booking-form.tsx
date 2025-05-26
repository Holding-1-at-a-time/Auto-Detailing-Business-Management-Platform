"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, User, Phone, Mail, Car, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createBookingAction } from "@/lib/actions/booking-actions"
import { useToast } from "@/hooks/use-toast"

interface BookingFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  vehicle: string
  service: string
  scheduledDate: Date
  scheduledTime: string
  estimatedDuration: number
  price: number
  notes?: string
}

interface BookingFormProps {
  tenantId: string
  initialData?: Partial<BookingFormData>
}

const services = [
  { value: "basic-wash", label: "Basic Wash", duration: 30, price: 30 },
  { value: "premium-wash", label: "Premium Wash", duration: 60, price: 60 },
  { value: "full-detail", label: "Full Detail", duration: 180, price: 150 },
  { value: "interior-detail", label: "Interior Detail", duration: 120, price: 100 },
  { value: "exterior-detail", label: "Exterior Detail", duration: 120, price: 100 },
  { value: "paint-correction", label: "Paint Correction", duration: 240, price: 300 },
  { value: "ceramic-coating", label: "Ceramic Coating", duration: 360, price: 500 },
]

const timeSlots = [
  "08:00",
  "08:30",
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
  "18:00",
]

export function BookingForm({ tenantId, initialData }: BookingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(initialData?.scheduledDate)
  const [selectedService, setSelectedService] = useState<string>(initialData?.service || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const service = services.find((s) => s.value === selectedService)
    if (!service) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const bookingData = {
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      clientPhone: formData.get("clientPhone") as string,
      vehicle: formData.get("vehicle") as string,
      service: selectedService,
      scheduledDate: date,
      scheduledTime: formData.get("scheduledTime") as string,
      estimatedDuration: service.duration,
      price: service.price,
      notes: formData.get("notes") as string,
    }

    try {
      await createBookingAction(tenantId, bookingData)
      toast({
        title: "Success",
        description: "Booking created successfully",
      })
      router.push(`/${tenantId}/bookings`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedServiceData = services.find((s) => s.value === selectedService)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Client Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientName"
                name="clientName"
                placeholder="John Doe"
                defaultValue={initialData?.clientName}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="john@example.com"
                defaultValue={initialData?.clientEmail}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                placeholder="(555) 123-4567"
                defaultValue={initialData?.clientPhone}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <div className="relative">
              <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="vehicle"
                name="vehicle"
                placeholder="2024 Tesla Model 3"
                defaultValue={initialData?.vehicle}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Service Details</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label} - ${service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedServiceData && (
            <div className="space-y-2">
              <Label>Duration & Price</Label>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedServiceData.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${selectedServiceData.price}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scheduling */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Schedule</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Time</Label>
            <Select name="scheduledTime" defaultValue={initialData?.scheduledTime}>
              <SelectTrigger id="scheduledTime">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special requests or notes..."
          defaultValue={initialData?.notes}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Booking"}
        </Button>
      </div>
    </form>
  )
}
