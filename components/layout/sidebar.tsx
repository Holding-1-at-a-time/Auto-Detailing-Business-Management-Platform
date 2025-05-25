"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTenant } from "@/hooks/useTenant"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { tenantId } = useTenant()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/${tenantId}/dashboard`,
      active: pathname === `/${tenantId}/dashboard`,
    },
    {
      label: "Bookings",
      icon: Calendar,
      href: `/${tenantId}/bookings`,
      active: pathname.startsWith(`/${tenantId}/bookings`),
    },
    {
      label: "Clients",
      icon: Users,
      href: `/${tenantId}/clients`,
      active: pathname.startsWith(`/${tenantId}/clients`),
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/${tenantId}/settings`,
      active: pathname.startsWith(`/${tenantId}/settings`),
    },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Auto-Detailer</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto md:hidden">
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
