"use server"

import httpClientInstance from "@/actions/http-client"

export interface BookingGpsLog {
  identifier: string
  gpsCoordinates: string
  createdAt: string
}

export interface BookingDetailDTO {
  identifier: string
  typeOfBooking: "shuttle" | "instant"
  departureLocationName: string
  departureLocationGpsCoordinates: string
  departureLocationType: string
  destinationLocationName: string
  destinationLocationGpsCoordinates: string
  destinationLocationType: string
  tripProgress: string
  estimatedDurationInSeconds: number
  estimatedDistanceInMeters: number
  status: string
  rideType: {
    identifier: string
    name: string
    description: string
    numberOfSeats: number
    pricePerKilometer: number
    basePrice: number
    minimumPrice: number
  }
  isRecurringBooking: boolean
  dateOfRide: string | null
  recurringBookingDates: {
    days?: string[]
    durationInWeeks?: number
  }
  assignedDriver: {
    identifier: string
    firstName: string
    lastName: string
    email: string
  } | null
  bookingPayment: {
    identifier: string
    basePrice: number
    discountAmount: number
    amountPaid: number
  }
  bookingGpsLogs: BookingGpsLog[]
  bookingReviews: {
    identifier: string
    rating: number
    review: string
  }[]
  createdAt: string
}

interface GetBookingResponse {
  status_code: number
  status: string
  message: string
  results: BookingDetailDTO
}

export default async function getBooking(
  identifier: string
): Promise<BookingDetailDTO> {
  const { data } = await httpClientInstance.get<GetBookingResponse>(
    `/bookings/${identifier}`
  )
  return data.results
}
