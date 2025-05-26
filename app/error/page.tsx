"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("code") || "500"
  const errorMessage = searchParams.get("message")

  const getErrorInfo = (code: string) => {
    switch (code) {
      case "400":
        return {
          title: "Bad Request",
          description: "The request was invalid or malformed.",
        }
      case "401":
        return {
          title: "Unauthorized",
          description: "You need to sign in to access this resource.",
        }
      case "403":
        return {
          title: "Forbidden",
          description: "You don't have permission to access this resource.",
        }
      case "404":
        return {
          title: "Not Found",
          description: "The page or resource you're looking for doesn't exist.",
        }
      case "500":
      default:
        return {
          title: "Server Error",
          description: "Something went wrong on our end. Please try again later.",
        }
    }
  }

  const errorInfo = getErrorInfo(errorCode)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            Error {errorCode}: {errorInfo.title}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{errorMessage || errorInfo.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="default" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
