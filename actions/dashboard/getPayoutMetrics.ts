"use server"

import httpClientInstance from "@/actions/http-client"

export interface PayoutMetrics {
  totalPendingPayouts: number
  totalApprovedPayoutsForPastMonth: number
  totalRejectedPayoutsForPastMonth: number
  totalApprovedPayoutAmountForPastMonth: number
}

interface GetPayoutMetricsResponse {
  status_code: number
  status: string
  message: string
  results: PayoutMetrics
}

export default async function getPayoutMetrics(): Promise<PayoutMetrics> {
  const { data } =
    await httpClientInstance.get<GetPayoutMetricsResponse>(
      `/admins/dashboard/payout-metrics`
    )
  return data.results
}
