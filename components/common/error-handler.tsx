"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorHandlerProps {
  error?: Error | null
  success?: string | null
  warning?: string | null
  clearError?: () => void
  clearSuccess?: () => void
  clearWarning?: () => void
  showToast?: boolean
  showAlert?: boolean
}

export function ErrorHandler({
  error,
  success,
  warning,
  clearError,
  clearSuccess,
  clearWarning,
  showToast = true,
  showAlert = true,
}: ErrorHandlerProps) {
  const { toast } = useToast()
  const [alertVisible, setAlertVisible] = useState(false)

  useEffect(() => {
    if (error && showToast) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })

      if (clearError) {
        clearError()
      }
    }

    if (success && showToast) {
      toast({
        title: "Success",
        description: success,
      })

      if (clearSuccess) {
        clearSuccess()
      }
    }

    if (warning && showToast) {
      toast({
        title: "Warning",
        description: warning,
        variant: "warning",
      })

      if (clearWarning) {
        clearWarning()
      }
    }

    if ((error || success || warning) && showAlert) {
      setAlertVisible(true)
    }
  }, [error, success, warning, toast, clearError, clearSuccess, clearWarning, showToast])

  if (!showAlert || !alertVisible) {
    return null
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message || "Something went wrong"}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {warning && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
