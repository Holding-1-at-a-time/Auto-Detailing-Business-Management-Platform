"use client"

import { createContext, useContext, type ReactNode, useState } from "react"

interface Breadcrumb {
  label: string
  href?: string
}

interface DashboardLayoutContextType {
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined)

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ label: "Dashboard", href: "/dashboard" }])

  return (
    <DashboardLayoutContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </DashboardLayoutContext.Provider>
  )
}

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext)
  if (!context) {
    throw new Error("useDashboardLayout must be used within a DashboardLayoutProvider")
  }
  return context
}
