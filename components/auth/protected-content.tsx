"use client"

import { SignedIn, SignedOut, useUser, useOrganization } from "@clerk/nextjs"
import type { ReactNode } from "react"

interface ProtectedContentProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedInContent({ children, fallback }: ProtectedContentProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>{fallback}</SignedOut>
    </>
  )
}

export function SignedOutContent({ children, fallback }: ProtectedContentProps) {
  return (
    <>
      <SignedOut>{children}</SignedOut>
      <SignedIn>{fallback}</SignedIn>
    </>
  )
}

export function RoleProtectedContent({ children, fallback, role }: ProtectedContentProps & { role: string }) {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string | undefined

  if (userRole === role) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

export function OrganizationAdminContent({ children, fallback }: ProtectedContentProps) {
  const { organization } = useOrganization()
  const isAdmin = organization?.membership?.role === "admin"

  if (isAdmin) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
