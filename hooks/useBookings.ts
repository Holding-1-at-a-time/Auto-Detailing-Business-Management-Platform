import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Booking } from "../types"
import {
  createBooking as createBookingApi,
  deleteBooking as deleteBookingApi,
  getBooking as getBookingApi,
  getBookings as getBookingsApi,
  updateBooking as updateBookingApi,
} from "../api/bookings"
import { useTenant } from "./useTenant"

export const useBookings = () => {
  const { tenantId } = useTenant()
  const queryClient = useQueryClient()

  const getBookings = async (): Promise<Booking[]> => {
    if (!tenantId) {
      return []
    }

    return await getBookingsApi(tenantId)
  }

  const getBooking = async (id: string): Promise<Booking | null> => {
    if (!tenantId) {
      return null
    }

    return await getBookingApi(tenantId, id)
  }

  const createBooking = async (booking: Omit<Booking, "id">): Promise<Booking> => {
    if (!tenantId) {
      throw new Error("Tenant ID is required")
    }

    return await createBookingApi(tenantId, booking)
  }

  const updateBooking = async (booking: Booking): Promise<Booking> => {
    if (!tenantId) {
      throw new Error("Tenant ID is required")
    }

    return await updateBookingApi(tenantId, booking)
  }

  const deleteBooking = async (id: string) => {
    return await deleteBookingApi({
      tenantId,
      bookingId: id,
    })
  }

  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery(["bookings", tenantId], getBookings, {
    enabled: !!tenantId,
  })

  const {
    data: booking,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useQuery(["booking"], getBooking, {
    enabled: false,
  })

  const createBookingMutation = useMutation(createBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"])
    },
  })

  const updateBookingMutation = useMutation(updateBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"])
    },
  })

  const deleteBookingMutation = useMutation(deleteBookingApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"])
    },
  })

  return {
    bookings,
    booking,
    isLoading,
    isBookingLoading,
    isError,
    isBookingError,
    createBooking: createBookingMutation.mutateAsync,
    updateBooking: updateBookingMutation.mutateAsync,
    deleteBooking: async (id: string) => {
      return await deleteBookingMutation.mutateAsync({ tenantId: tenantId!, bookingId: id })
    },
    createBookingMutation,
    updateBookingMutation,
    deleteBookingMutation,
  }
}
