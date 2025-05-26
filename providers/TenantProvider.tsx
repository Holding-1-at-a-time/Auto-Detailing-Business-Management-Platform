"use client"

import type React from "react"
import { createContext, useContext } from "react"

// Define the tenant context type
interface TenantContextType {
  id: string
  name: string
  slug: string
  // Add other tenant properties as needed
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType | null>(null)

// Provider component
export function TenantProvider({
  children,
  tenant,
}: {
  children: React.ReactNode
  tenant: TenantContextType
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
}

// Custom hook to use the tenant context
export function useTenant() {
  const context = useContext(TenantContext)

  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider")
  }

  return context
}
