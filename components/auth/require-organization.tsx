"use client"

import type React from "react"

import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RequireOrganizationProps {
  children: React.ReactNode
  fallbackUrl?: string
}

export function RequireOrganization({ children, fallbackUrl = "/create-organization" }: RequireOrganizationProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { isLoaded: orgListLoaded, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })
  const router = useRouter()

  useEffect(() => {
    if (!orgLoaded || !orgListLoaded) return

    // If user has no organization and no memberships, redirect to create one
    if (!organization && userMemberships.count === 0) {
      router.push(fallbackUrl)
    }
  }, [organization, orgLoaded, orgListLoaded, userMemberships.count, router, fallbackUrl])

  if (!orgLoaded || !orgListLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No Organization Selected</h2>
          <p className="mt-2 text-muted-foreground">Please select an organization to continue.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
