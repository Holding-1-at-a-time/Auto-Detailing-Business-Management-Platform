"use client"

import { useUser } from "@clerk/nextjs"

export function useUserRole() {
  const { user, isLoaded } = useUser()

  const role = user?.publicMetadata?.role as string | undefined

  const isAdmin = role === "admin" || role === "owner"
  const isOwner = role === "owner"
  const isStaff = role === "staff"
  const isManager = role === "manager"

  return {
    role,
    isAdmin,
    isOwner,
    isStaff,
    isManager,
    isLoaded,
  }
}
