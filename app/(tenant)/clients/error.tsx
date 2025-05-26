"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { captureException } from "@/lib/sentry"
import { useRouter } from "next/navigation"

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    captureException(error, {
      tags: {
        page: "clients",
        errorBoundary: "route",
      },
    })
  }, [error])

  return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Clients Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">There was an error loading your clients. Please try again.</p>
          {error.digest && <p className="text-sm text-muted-foreground mb-4">Error ID: {error.digest}</p>}
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="default" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
