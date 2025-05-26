"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "@/hooks/useTenant"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationCenter() {
  const { tenantId } = useTenant()
  const [isOpen, setIsOpen] = useState(false)

  const notifications = useQuery(api.notifications.getNotifications, {
    tenantId,
    limit: 20,
    includeRead: false,
  })

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead)

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead({ notificationId })
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({ tenantId })
    setIsOpen(false)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_created":
        return "🗓️"
      case "booking_confirmation":
        return "✅"
      case "booking_reschedule":
        return "🔄"
      case "booking_cancellation":
        return "❌"
      case "workflow_error":
        return "⚠️"
      default:
        return "📌"
    }
  }

  const getNotificationTime = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return "Just now"
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications && notifications.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            {notifications && notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {!notifications || notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No new notifications</div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-4 hover:bg-muted transition-colors"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
