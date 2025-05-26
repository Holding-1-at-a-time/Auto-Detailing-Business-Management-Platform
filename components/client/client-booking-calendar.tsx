"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ClientTimeSlots } from "./client-time-slots"
import { ClientBookingForm } from "./client-booking-form"
import { ClientBookingAgent } from "./client-booking-agent"
import { format, addDays, startOfDay } from "date-fns"
import { MessageSquare, CalendarPlus2Icon as CalendarIcon2 } from "lucide-react"

interface ClientBookingCalendarProps {
  tenantId: string
}

export function ClientBookingCalendar({ tenantId }: ClientBookingCalendarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string>("Basic Wash")
  const [bookingStep, setBookingStep] = useState<"date" | "details">("date")
  const [bookingMethod, setBookingMethod] = useState<"calendar" | "agent">("calendar")

  // Get available time slots for the selected date
  const timeSlots = useQuery(
    api.scheduling.getAvailableTimeSlots,
    selectedDate
      ? {
          tenantId,
          date: selectedDate.toISOString(),
          service: selectedService,
        }
      : "skip",
  )

  // Get service details
  const services = useQuery(api.scheduling.getServiceDetails, {
    tenantId,
    service: selectedService,
  })

  // Create client booking mutation
  const createClientBooking = useMutation(api.clientBookings.createClientBooking)

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime(null)
  }, [selectedDate])

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  // Handle time slot selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // Handle service selection
  const handleServiceSelect = (service: string) => {
    setSelectedService(service)
    setSelectedTime(null) // Reset time when service changes as duration might affect availability
  }

  // Handle continue to details
  const handleContinueToDetails = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a date and time",
        variant: "destructive",
      })
      return
    }
    setBookingStep("details")
  }

  // Handle back to date selection
  const handleBackToDate = () => {
    setBookingStep("date")
  }

  // Handle form submission
  const handleSubmitBooking = async (clientData: {
    name: string
    email: string
    phone: string
    notes: string
    vehicleType: string
  }) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a date and time",
        variant: "destructive",
      })
      return
    }

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const bookingDateTime = new Date(selectedDate)
      bookingDateTime.setHours(hours, minutes, 0, 0)

      // Create booking
      const bookingId = await createClientBooking({
        tenantId,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        service: selectedService,
        dateTime: bookingDateTime.getTime(),
        notes: clientData.notes,
        vehicleType: clientData.vehicleType,
      })

      // Show success message
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment has been scheduled for ${format(bookingDateTime, "PPP")} at ${selectedTime}`,
      })

      // Redirect to confirmation page
      router.push(`/${tenantId}/booking-confirmation/${bookingId}`)
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Disable past dates
  const disabledDays = {
    before: startOfDay(new Date()),
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" onValueChange={(value) => setBookingMethod(value as "calendar" | "agent")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon2 className="h-4 w-4" />
            <span>Calendar Booking</span>
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          {bookingStep === "date" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Choose your preferred appointment date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Service</CardTitle>
                    <CardDescription>Choose the service you need</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClientServiceSelector selectedService={selectedService} onServiceSelect={handleServiceSelect} />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Times</CardTitle>
                      <CardDescription>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClientTimeSlots
                        timeSlots={timeSlots || []}
                        selectedTime={selectedTime}
                        onTimeSelect={handleTimeSelect}
                        isLoading={timeSlots === undefined}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleContinueToDetails} disabled={!selectedTime} className="w-full">
                        Continue
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Details</CardTitle>
                    <CardDescription>
                      {selectedDate && selectedTime
                        ? `Booking for ${format(selectedDate, "EEEE, MMMM d")} at ${selectedTime}`
                        : "Complete your booking"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackToDate}>
                    Change Date & Time
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ClientBookingForm onSubmit={handleSubmitBooking} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Book with AI Assistant</CardTitle>
              <CardDescription>Tell our AI assistant when you'd like to book and what service you need</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientBookingAgent tenantId={tenantId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Service selector component
function ClientServiceSelector({
  selectedService,
  onServiceSelect,
}: {
  selectedService: string
  onServiceSelect: (service: string) => void
}) {
  const services = [
    { id: "Basic Wash", name: "Basic Wash", duration: "30 min", price: "$29.99" },
    { id: "Interior Detailing", name: "Interior Detailing", duration: "1 hour", price: "$89.99" },
    { id: "Exterior Detailing", name: "Exterior Detailing", duration: "1 hour", price: "$99.99" },
    { id: "Full Detailing", name: "Full Detailing", duration: "2 hours", price: "$179.99" },
    { id: "Ceramic Coating", name: "Ceramic Coating", duration: "2 hours", price: "$299.99" },
    { id: "Paint Correction", name: "Paint Correction", duration: "3 hours", price: "$349.99" },
  ]

  return (
    <div className="grid grid-cols-1 gap-2">
      {services.map((service) => (
        <Button
          key={service.id}
          variant={selectedService === service.id ? "default" : "outline"}
          className="justify-between h-auto py-3"
          onClick={() => onServiceSelect(service.id)}
        >
          <span>{service.name}</span>
          <span className="text-sm opacity-80">
            {service.duration} - {service.price}
          </span>
        </Button>
      ))}
    </div>
  )
}
