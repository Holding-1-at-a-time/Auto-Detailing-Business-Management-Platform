"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useTenant } from "@/hooks/useTenant"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const { tenantId, tenant, isLoading } = useTenant()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!isLoading && !tenant && tenantId) {
      router.push("/tenant-not-found")
    }
  }, [isLoading, tenant, tenantId, router])

  if (!isLoaded || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isSignedIn) {
    return null
  }

  if (!tenant && tenantId) {
    return null
  }

  return <>{children}</>
}
