"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "@/hooks/useTenant"
import { Bell, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationCenter() {
  const { tenantId } = useTenant()
  const [open, setOpen] = useState(false)

  const notifications = useQuery(api.notifications.getNotifications, {
    tenantId,
    limit: 20,
  })

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead({
      tenantId,
      notificationId,
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        <ScrollArea className="h-80">
          {notifications?.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications?.map((notification) => (
                <div key={notification._id} className={`p-4 ${notification.isRead ? "bg-white" : "bg-blue-50"}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{notification.message}</p>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
