"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function SettingsNotifications() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      const successMessages = {
        google_calendar_connected: {
          title: "Google Calendar Connected!",
          description: "Your bookings will now sync with Google Calendar automatically.",
          icon: <CheckCircle className="h-4 w-4" />,
        },
        settings_updated: {
          title: "Settings Updated",
          description: "Your business settings have been saved successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
        },
        billing_updated: {
          title: "Billing Updated",
          description: "Your subscription has been updated successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
        },
      }

      const message = successMessages[success as keyof typeof successMessages]
      if (message) {
        toast({
          title: message.title,
          description: message.description,
        })
      }
    }

    if (error) {
      const errorMessages = {
        google_calendar_failed: {
          title: "Google Calendar Connection Failed",
          description: "Unable to connect to Google Calendar. Please try again.",
          icon: <XCircle className="h-4 w-4" />,
        },
        oauth_callback_failed: {
          title: "OAuth Error",
          description: "Authentication failed. Please try connecting again.",
          icon: <XCircle className="h-4 w-4" />,
        },
        invalid_state: {
          title: "Security Error",
          description: "Invalid authentication state. Please try again.",
          icon: <AlertCircle className="h-4 w-4" />,
        },
        missing_parameters: {
          title: "Configuration Error",
          description: "Missing required parameters. Please contact support.",
          icon: <AlertCircle className="h-4 w-4" />,
        },
      }

      const message = errorMessages[error as keyof typeof errorMessages]
      if (message) {
        toast({
          title: message.title,
          description: message.description,
          variant: "destructive",
        })
      }
    }
  }, [searchParams, toast])

  return null
}
