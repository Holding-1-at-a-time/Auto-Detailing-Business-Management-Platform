"use client"

/**
 * @description      : Hook for interacting with Convex workpools
 * @author           : rrome
 * @created          : 26/05/2025
 */
import { useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../lib/convex/convex-client"
import type { Id } from "../convex/_generated/dataModel"

export function useBookingWorkpool() {
  const [workId, setWorkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBooking = useMutation(api.workpools.createBookingWithWorkpool)
  const getWorkStatus = useQuery(api.workpools.getBookingWorkStatus, workId ? { workId } : "skip")
  const cancelWork = useMutation(api.workpools.cancelBookingWork)

  const submitBooking = useCallback(
    async (
      tenantId: Id<"tenants">,
      clientId: Id<"clients">,
      serviceId: Id<"services">,
      dateTime: number,
      notes?: string,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await createBooking({
          tenantId,
          clientId,
          serviceId,
          dateTime,
          notes,
        })

        setWorkId(result.workId)
        return result.workId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create booking")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [createBooking],
  )

  const cancelBooking = useCallback(
    async (workIdToCancel: string) => {
      if (!workIdToCancel) return false

      try {
        await cancelWork({ workId: workIdToCancel })
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel booking")
        return false
      }
    },
    [cancelWork],
  )

  return {
    submitBooking,
    cancelBooking,
    workId,
    status: getWorkStatus,
    isLoading,
    error,
  }
}
