"use client"

import { NotificationCenter } from "@/components/notifications/notification-center"

export function NavbarExtension() {
  return (
    <div className="flex items-center space-x-2">
      <NotificationCenter />
    </div>
  )
}
