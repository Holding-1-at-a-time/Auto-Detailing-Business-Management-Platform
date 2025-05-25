"use client"

import type React from "react"

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { requireTenantAccess } from "@/lib/auth"
import { useState } from "react"

interface TenantLayoutProps {
  params: { tenant: string }
  children: React.ReactNode
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <ProtectedRoute>
      <TenantLayoutClient>{children}</TenantLayoutClient>
    </ProtectedRoute>
  )
}

// Client component for state management
function TenantLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto py-6 px-4 md:px-6">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
