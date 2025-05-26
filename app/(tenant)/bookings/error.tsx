"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BookingsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading bookings</AlertTitle>
        <AlertDescription>{error.message || "Something went wrong while loading your bookings."}</AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
