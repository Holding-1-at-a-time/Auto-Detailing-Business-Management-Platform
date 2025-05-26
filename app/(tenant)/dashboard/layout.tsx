import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardLayoutProvider } from "@/contexts/dashboard-layout-context"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { tenant: string }
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { userId, orgId } = auth()

  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  // Fetch tenant settings from Convex
  const tenantSettings = await fetchQuery(api.tenants.getTenantSettings, {
    tenantId: params.tenant,
  })

  if (!tenantSettings) {
    redirect("/tenant-not-found")
  }

  return (
    <DashboardLayoutProvider>
      <div className="min-h-screen bg-background">
        <Navbar tenantName={tenantSettings.businessName} tenantLogo={tenantSettings.logo} tenantId={params.tenant} />
        <div className="flex">
          <Sidebar tenantId={params.tenant} />
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </DashboardLayoutProvider>
  )
}
