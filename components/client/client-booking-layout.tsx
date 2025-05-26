import type React from "react"
import { ClientHeader } from "./client-header"
import { ClientFooter } from "./client-footer"
import { ThemeProvider } from "@/components/theme-provider"

interface ClientBookingLayoutProps {
  children: React.ReactNode
  tenant: {
    id: string
    name: string
    logoUrl?: string
  }
}

export function ClientBookingLayout({ children, tenant }: ClientBookingLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col">
        <ClientHeader tenant={tenant} />
        <main className="flex-1">{children}</main>
        <ClientFooter tenant={tenant} />
      </div>
    </ThemeProvider>
  )
}
