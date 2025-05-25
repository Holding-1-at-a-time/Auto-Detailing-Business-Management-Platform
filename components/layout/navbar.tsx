"use client"

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { useTenant } from "@/hooks/useTenant"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  toggleSidebar: () => void
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { tenant } = useTenant()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex items-center space-x-2">
          <Link href={`/${tenant?.id}/dashboard`} className="font-semibold">
            {tenant?.name || "Auto-Detailing Business"}
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
