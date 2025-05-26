import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book Your Auto Detailing Service",
  description: "Schedule your professional auto detailing appointment online",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
