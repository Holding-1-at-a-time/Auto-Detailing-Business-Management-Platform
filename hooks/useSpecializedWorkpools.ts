"use client"

/**
 * @description      : Hooks for interacting with specialized Convex workpools
 * @author           : rrome
 * @created          : 27/05/2025
 */
import { useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../lib/convex/convex-client"
import type { Id } from "../convex/_generated/dataModel"

// Inventory workpool hook
export function useInventoryWorkpool() {
  const [workId, setWorkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const orderInventory = useMutation(api.specializedWorkpools.orderInventory)
  const getWorkStatus = useQuery(
    api.workpools.getBookingWorkStatus, // Reusing the general status query
    workId ? { workId } : "skip",
  )

  const placeOrder = useCallback(
    async (
      tenantId: Id<"tenants">,
      supplierId: string,
      items: Array<{
        inventoryItemId: Id<"inventory">
        quantity: number
        unitPrice: number
      }>,
      notes?: string,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await orderInventory({
          tenantId,
          supplierId,
          items,
          notes,
        })

        setWorkId(result.workId)
        return result.workId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to place inventory order")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [orderInventory],
  )

  return {
    placeOrder,
    workId,
    status: getWorkStatus,
    isLoading,
    error,
  }
}

// Staff scheduling workpool hook
export function useStaffSchedulingWorkpool() {
  const [workId, setWorkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSchedule = useMutation(api.specializedWorkpools.createStaffSchedule)
  const getScheduleStatus = useQuery(api.specializedWorkpools.getScheduleStatus, workId ? { workId } : "skip")

  const generateSchedule = useCallback(
    async (tenantId: Id<"tenants">, startDate: number, endDate: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await createSchedule({
          tenantId,
          startDate,
          endDate,
        })

        setWorkId(result.workId)
        return result.workId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate staff schedule")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [createSchedule],
  )

  return {
    generateSchedule,
    workId,
    status: getScheduleStatus,
    isLoading,
    error,
  }
}

// Customer feedback workpool hook
export function useFeedbackWorkpool() {
  const [feedbackId, setFeedbackId] = useState<Id<"feedback"> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitFeedback = useMutation(api.specializedWorkpools.submitFeedback)

  const sendFeedback = useCallback(
    async (
      tenantId: Id<"tenants">,
      clientId: Id<"clients">,
      bookingId: Id<"bookings">,
      rating: number,
      comments?: string,
      categories?: string[],
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await submitFeedback({
          tenantId,
          clientId,
          bookingId,
          rating,
          comments,
          categories,
        })

        setFeedbackId(result.feedbackId as Id<"feedback">)
        return result.feedbackId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit feedback")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [submitFeedback],
  )

  return {
    sendFeedback,
    feedbackId,
    isLoading,
    error,
  }
}

// Marketing workpool hook
export function useMarketingWorkpool() {
  const [campaignId, setCampaignId] = useState<Id<"marketingCampaigns"> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCampaign = useMutation(api.specializedWorkpools.createMarketingCampaign)
  const sendCampaign = useMutation(api.specializedWorkpools.sendCampaign)

  const createMarketingCampaign = useCallback(
    async (
      tenantId: Id<"tenants">,
      campaignName: string,
      targetSegment: string,
      serviceIds: Array<Id<"services">>,
      validUntil: number,
      discountPercentage?: number,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await createCampaign({
          tenantId,
          campaignName,
          targetSegment,
          serviceIds,
          validUntil,
          discountPercentage,
        })

        setCampaignId(result.campaignId as Id<"marketingCampaigns">)
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create marketing campaign")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [createCampaign],
  )

  const sendMarketingCampaign = useCallback(
    async (tenantId: Id<"tenants">, campaignId: Id<"marketingCampaigns">) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await sendCampaign({
          tenantId,
          campaignId,
        })

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send marketing campaign")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [sendCampaign],
  )

  return {
    createMarketingCampaign,
    sendMarketingCampaign,
    campaignId,
    isLoading,
    error,
  }
}

// Financial workpool hook
export function useFinancialWorkpool() {
  const [workId, setWorkId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = useMutation(api.specializedWorkpools.makePayment)
  const getPaymentStatus = useQuery(api.specializedWorkpools.getPaymentStatus, workId ? { workId } : "skip")

  const makePayment = useCallback(
    async (
      tenantId: Id<"tenants">,
      bookingId: Id<"bookings">,
      clientId: Id<"clients">,
      amount: number,
      paymentMethod: string,
      paymentDetails: Record<string, any>,
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await processPayment({
          tenantId,
          bookingId,
          clientId,
          amount,
          paymentMethod,
          paymentDetails,
        })

        setWorkId(result.workId)
        return result.workId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process payment")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [processPayment],
  )

  return {
    makePayment,
    workId,
    status: getPaymentStatus,
    isLoading,
    error,
  }
}
