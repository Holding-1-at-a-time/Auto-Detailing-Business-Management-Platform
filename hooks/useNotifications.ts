"use client"

import { useEffect, useCallback } from "react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { useTenant } from "./useTenant"
import { usePathname } from "next/navigation"

type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationEvent {
  type: string
  message: string
  data?: any
  timestamp: number
}

export function useNotifications() {
  const { toast } = useToast()
  const { tenantId } = useTenant()
  const convex = useConvex()
  const pathname = usePathname()

  const showToast = useCallback(
    (message: string, type: NotificationType = "info") => {
      toast({
        title: type === "error" ? "Error" : type === "success" ? "Success" : "Info",
        description: message,
        variant: type === "error" ? "destructive" : "default",
      })
    },
    [toast],
  )

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!tenantId) return

    const unsubscribe = convex.watchQuery(
      api.notifications.getRealtimeNotifications,
      {
        tenantId,
      },
      (notifications) => {
        if (!notifications) return

        notifications.forEach((notification: NotificationEvent) => {
          // Only show notifications relevant to current page
          const shouldShow = shouldShowNotification(notification, pathname)

          if (shouldShow) {
            showToast(notification.message, getNotificationType(notification.type))
          }
        })
      },
    )

    return unsubscribe
  }, [tenantId, convex, pathname, showToast])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!tenantId) return

      try {
        await convex.mutation(api.notifications.markAsRead, {
          tenantId,
          notificationId,
        })
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    },
    [tenantId, convex],
  )

  const sendNotification = useCallback(
    async (type: string, message: string, data?: any) => {
      if (!tenantId) return

      try {
        await convex.mutation(api.notifications.createNotification, {
          tenantId,
          type,
          message,
          data,
        })
      } catch (error) {
        console.error("Failed to send notification:", error)
      }
    },
    [tenantId, convex],
  )

  return {
    showToast,
    markAsRead,
    sendNotification,
  }
}

function shouldShowNotification(notification: NotificationEvent, pathname: string): boolean {
  const { type } = notification

  // Show booking notifications on booking pages
  if (type.includes("booking") && pathname.includes("/bookings")) {
    return true
  }

  // Show client notifications on client pages
  if (type.includes("client") && pathname.includes("/clients")) {
    return true
  }

  // Show billing notifications on settings/billing pages
  if (type.includes("billing") && pathname.includes("/settings")) {
    return true
  }

  // Show system notifications everywhere
  if (type.includes("system") || type.includes("error")) {
    return true
  }

  return false
}

function getNotificationType(type: string): NotificationType {
  if (type.includes("error") || type.includes("failed")) return "error"
  if (type.includes("success") || type.includes("completed")) return "success"
  if (type.includes("warning") || type.includes("limit")) return "warning"
  return "info"
}
