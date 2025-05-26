"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"

interface RoleContextType {
  role: string | null
  isAdmin: boolean
  isManager: boolean
  isStaff: boolean
  isUser: boolean
  isLoaded: boolean
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  isAdmin: false,
  isManager: false,
  isStaff: false,
  isUser: false,
  isLoaded: false,
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()

  const role = user?.publicMetadata?.role as string | null

  const isAdmin = role === "admin" || role === "owner"
  const isManager = role === "manager"
  const isStaff = role === "staff"
  const isUser = !!role // Any role is considered a user

  return (
    <RoleContext.Provider
      value={{
        role,
        isAdmin,
        isManager,
        isStaff,
        isUser,
        isLoaded,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
