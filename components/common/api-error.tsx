"use client"

import { useEffect, useState } from "react"
import { AlertCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ApiErrorProps {
  title?: string
  error?: Error | string | null
  reset?: () => void
  className?: string
}

export function ApiError({ title = "An error occurred", error, reset, className }: ApiErrorProps) {
  const [visible, setVisible] = useState(true)
  const errorMessage = error instanceof Error ? error.message : error

  useEffect(() => {
    if (error) {
      setVisible(true)
    }
  }, [error])

  if (!error || !visible) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setVisible(false)}>
          <XCircle className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        {errorMessage || "Something went wrong. Please try again later."}
        {reset && (
          <Button variant="outline" size="sm" onClick={reset} className="ml-2">
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
