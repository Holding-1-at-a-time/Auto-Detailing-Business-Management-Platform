"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedTime: string
  onTimeSelect: (time: string) => void
  isLoading: boolean
}

export function TimeSlotPicker({ slots, selectedTime, onTimeSelect, isLoading }: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const morningSlots = slots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    return hour < 12
  })

  const afternoonSlots = slots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    return hour >= 12
  })

  const availableCount = slots.filter((slot) => slot.available).length

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No time slots available for this date.</p>
        <p className="text-sm mt-2">Please try selecting a different date.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {availableCount} time {availableCount === 1 ? "slot" : "slots"} available
        </p>
      </div>

      {morningSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Morning</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {morningSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => slot.available && onTimeSelect(slot.time)}
                className={cn("h-12", !slot.available && "opacity-50 cursor-not-allowed")}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Afternoon</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {afternoonSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => slot.available && onTimeSelect(slot.time)}
                className={cn("h-12", !slot.available && "opacity-50 cursor-not-allowed")}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
