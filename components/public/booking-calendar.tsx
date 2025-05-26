"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ServiceSelector } from "./service-selector"
import { TimeSlotPicker } from "./time-slot-picker"
import { BookingForm } from "./booking-form"
import { BookingAgentModal } from "./booking-agent-modal"
import type { Id } from "@/convex/_generated/dataModel"

interface BookingCalendarProps {
  tenantId: Id<"tenants">
  tenantName: string
}

export function BookingCalendar({ tenantId, tenantName }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showAIAgent, setShowAIAgent] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Get available time slots for the selected date and service
  const availableSlots = useQuery(
    api.scheduling.getAvailableTimeSlots,
    selectedService && selectedDate
      ? {
          tenantId,
          date: format(selectedDate, "yyyy-MM-dd"),
          service: selectedService,
        }
      : "skip",
  )

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime("")
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  const handlePreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const handleBookingComplete = () => {
    setShowBookingForm(false)
    setSelectedTime("")
    setSelectedService("")
    // You could show a success message here
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Book with Calendar
            </TabsTrigger>
            <TabsTrigger value="ai" onClick={() => setShowAIAgent(true)}>
              <MessageSquare className="h-4 w-4" />
              Book with AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Step 1: Select Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                    1
                  </span>
                  Select Your Service
                </CardTitle>
                <CardDescription>Choose the auto detailing service you need</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceSelector
                  tenantId={tenantId}
                  selectedService={selectedService}
                  onServiceSelect={setSelectedService}
                />
              </CardContent>
            </Card>

            {/* Step 2: Select Date */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                      2
                    </span>
                    Select a Date
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Week Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="text-lg font-semibold">
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                      </h3>
                      <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const isPast = day < new Date() && !isToday(day)
                        const isSelected = isSameDay(day, selectedDate)

                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                            className={cn(
                              "p-4 rounded-lg border text-center transition-all",
                              isPast && "opacity-50 cursor-not-allowed bg-gray-50",
                              !isPast && !isSelected && "hover:border-primary hover:bg-primary/5",
                              isSelected && "border-primary bg-primary text-white",
                              isToday(day) && !isSelected && "border-primary/50 bg-primary/10",
                            )}
                          >
                            <div className="text-xs font-medium">{format(day, "EEE")}</div>
                            <div className="text-2xl font-bold mt-1">{format(day, "d")}</div>
                            {isToday(day) && <div className="text-xs mt-1">{isSelected ? "Today" : "Today"}</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Select Time */}
            {selectedService && selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                      3
                    </span>
                    Select a Time
                  </CardTitle>
                  <CardDescription>
                    Available time slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSlotPicker
                    slots={availableSlots || []}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                    isLoading={availableSlots === undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* AI Assistant Prompt */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Need Help Booking?</h3>
                    <p className="text-sm text-gray-600">
                      Our AI assistant can help you find the perfect time slot and answer any questions
                    </p>
                  </div>
                  <Button onClick={() => setShowAIAgent(true)} className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat with AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">{/* This tab automatically opens the AI modal */}</TabsContent>
        </Tabs>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && selectedDate && selectedTime && (
        <BookingForm
          tenantId={tenantId}
          service={selectedService}
          date={selectedDate}
          time={selectedTime}
          onClose={() => setShowBookingForm(false)}
          onComplete={handleBookingComplete}
        />
      )}

      {/* AI Agent Modal */}
      {showAIAgent && (
        <BookingAgentModal
          tenantId={tenantId}
          tenantName={tenantName}
          onClose={() => setShowAIAgent(false)}
          prefilledService={selectedService}
          prefilledDate={selectedDate}
        />
      )}
    </>
  )
}
