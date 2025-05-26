"use client"

import type React from "react"

import { useUser, useOrganization } from "@clerk/nextjs"
import { useEffect } from "react"
import { setUserContext, clearUserContext } from "@/lib/sentry"
import { useTenant } from "@/hooks/useTenant"

export function SentryProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { organization } = useOrganization()
  const { tenantId } = useTenant()

  useEffect(() => {
    if (userLoaded && user) {
      setUserContext({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || undefined,
        tenantId: tenantId || undefined,
        organizationId: organization?.id,
      })
    } else if (userLoaded && !user) {
      clearUserContext()
    }
  }, [user, userLoaded, tenantId, organization])

  return <>{children}</>
}
