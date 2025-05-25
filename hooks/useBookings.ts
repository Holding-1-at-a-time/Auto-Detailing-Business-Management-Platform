"use client"

import { useQuery, useMutation } from "convex/react"
import { useTenant } from "./useTenant"
import type { Booking } from "@/lib/types"

interface BookingFilters {
  upcoming?: boolean
  clientId?: string
  limit?: number
  status?: "scheduled" | "completed" | "cancelled"
}

export function useBookings(filters: BookingFilters = {}) {
  const { tenantId } = useTenant()

  const bookings = useQuery("bookings.getBookings", {
    tenantId,
    ...filters,
  }) as Booking[] | undefined

  const createBookingMutation = useMutation("bookings.createBooking")
  const updateBookingMutation = useMutation("bookings.updateBooking")
  const deleteBookingMutation = useMutation("bookings.deleteBooking")

  const createBooking = async (data: Omit<Booking, "id" | "tenantId" | "createdAt" | "updatedAt">) => {
    return await createBookingMutation({
      tenantId,
      ...data,
    })
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    return await updateBookingMutation({
      tenantId,
      id,
      ...updates,
    })
  }

  const deleteBooking = async (id: string) => {
    return await updateBookingMutation({
      tenantId,
      id,
      status: "cancelled",
    })
  }

  return {
    bookings,
    isLoading: bookings === undefined,
    createBooking,
    updateBooking,
    deleteBooking,
  }
}
