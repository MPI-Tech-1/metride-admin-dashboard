"use server"

import httpClientInstance from "@/actions/http-client"

export interface CustomerMetrics {
  totalCustomerCount: number
  totalActiveCustomerForTheMonth: number
  totalNewCustomerForTheMonth: number
  totalInActiveCustomer: number
}

interface GetCustomerMetricsResponse {
  status_code: number
  status: string
  message: string
  results: CustomerMetrics
}

export default async function getCustomerMetrics(): Promise<CustomerMetrics> {
  const { data } =
    await httpClientInstance.get<GetCustomerMetricsResponse>(
      `/dashboard/customer-metrics`
    )
  return data.results
}
