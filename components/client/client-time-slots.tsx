"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

interface TimeSlot {
  time: string
  available: boolean
}

interface ClientTimeSlotsProps {
  timeSlots: TimeSlot[]
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  isLoading: boolean
}

export function ClientTimeSlots({ timeSlots, selectedTime, onTimeSelect, isLoading }: ClientTimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No available time slots for this date</p>
        <p className="text-xs text-muted-foreground">Please select another date</p>
      </div>
    )
  }

  // Group time slots by morning, afternoon, evening
  const morning = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    return hour >= 7 && hour < 12
  })

  const afternoon = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    return hour >= 12 && hour < 17
  })

  const evening = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    return hour >= 17 && hour < 22
  })

  const renderTimeSlots = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.time}
              variant={selectedTime === slot.time ? "default" : "outline"}
              size="sm"
              disabled={!slot.available}
              onClick={() => slot.available && onTimeSelect(slot.time)}
              className={!slot.available ? "opacity-50" : ""}
            >
              {formatTime(slot.time)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderTimeSlots(morning, "Morning")}
      {renderTimeSlots(afternoon, "Afternoon")}
      {renderTimeSlots(evening, "Evening")}
    </div>
  )
}

// Helper function to format time from 24h to 12h format
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
}
