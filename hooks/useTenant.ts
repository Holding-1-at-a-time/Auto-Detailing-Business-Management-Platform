"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { useState, useEffect } from "react"

export function useTenant() {
  const params = useParams()
  const tenantId = params?.tenant as string

  const tenant = useQuery("tenants.getTenantById", { tenantId })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (tenant !== undefined) {
      setIsLoading(false)
    }
  }, [tenant])

  return {
    tenantId,
    tenant,
    isLoading,
    error,
  }
}
