"use server"

import httpClientInstance from "@/actions/http-client"
import PaginationMeta from "@/types/pagination-meta"

interface BookingPerson {
  identifier: string
  firstName: string
  lastName: string
  email: string
}

interface BookingLocation {
  name: string
  gpsCoordinates: string
  type: string
}

interface RideType {
  identifier: string
  name: string
  numberOfSeats: number
  pricePerKilometer: number
  minimumPrice: number
}

interface BookingPayment {
  identifier: string
  paymentMethod: string
  basePrice: number
  paymentStatus: string
}

export interface ListBookingDTO {
  identifier: string
  typeOfBooking: "shuttle" | "instant"
  status: string
  tripProgress: string
  isRecurringBooking: boolean
  dateOfRide: string | null
  recurringBookingDates: {
    days?: string[]
    durationInWeeks?: number
  }
  rideType: RideType
  bookingPayment: BookingPayment
  departureLocation: BookingLocation
  customer: BookingPerson
  assignedDriver: BookingPerson | null
  destinationLocation: BookingLocation
  createdAt: string
}

interface ListBookingsResponse {
  status_code: number
  status: string
  message: string
  results: {
    bookings: ListBookingDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listBookings({
  page = 1,
  limit = 10,
  customerIdentifier,
  assignedDriverIdentifier,
}: {
  page?: number
  limit?: number
  customerIdentifier?: string
  assignedDriverIdentifier?: string
} = {}): Promise<{
  bookings: ListBookingDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListBookingsResponse>(
    `/bookings`,
    {
      params: {
        page,
        limit,
        ...(customerIdentifier ? { customerIdentifier } : {}),
        ...(assignedDriverIdentifier ? { assignedDriverIdentifier } : {}),
      },
    }
  )
  return {
    bookings: data.results.bookings,
    paginationMeta: data.results.paginationMeta,
  }
}
