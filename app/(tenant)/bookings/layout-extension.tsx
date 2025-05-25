import type React from "react"
import { BookingAgentWidget } from "@/components/bookings/booking-agent-widget"

export function BookingsLayoutExtension({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BookingAgentWidget />
    </>
  )
}
