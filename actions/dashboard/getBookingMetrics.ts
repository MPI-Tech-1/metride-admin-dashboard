"use server"

import httpClientInstance from "@/actions/http-client"

export interface BookingMetrics {
  totalBookingsForPastMonth: number
  totalCompletedBookingsForPastMonth: number
  totalCancelledBookingsForPastMonth: number
}

interface GetBookingMetricsResponse {
  status_code: number
  status: string
  message: string
  results: BookingMetrics
}

export default async function getBookingMetrics(): Promise<BookingMetrics> {
  const { data } =
    await httpClientInstance.get<GetBookingMetricsResponse>(
      `/admins/dashboard/booking-metrics`
    )
  return data.results
}
