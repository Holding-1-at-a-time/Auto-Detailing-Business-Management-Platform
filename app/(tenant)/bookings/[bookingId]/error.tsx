"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BookingDetailsError({ error, reset }: ErrorProps) {
  const params = useParams<{ tenant: string }>()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading booking details</AlertTitle>
        <AlertDescription>
          {error.message || "Something went wrong while loading the booking details."}
        </AlertDescription>
      </Alert>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href={`/${params.tenant}/bookings`}>Back to bookings</Link>
        </Button>
      </div>
    </div>
  )
}
