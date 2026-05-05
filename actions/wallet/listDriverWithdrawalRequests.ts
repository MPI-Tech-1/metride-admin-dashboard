"use server"

import httpClientInstance from "@/actions/http-client"
import PaginationMeta from "@/types/pagination-meta"

export interface DriverWithdrawalRequestDTO {
  identifier: string
  amount: number
  status: "pending" | "approved" | "rejected"
  driver: {
    identifier: string
    fullName: string
  }
  createdAt: string
}

interface ListDriverWithdrawalRequestsResponse {
  status_code: number
  status: string
  message: string
  results: {
    driverWalletWithdrawalRequests: DriverWithdrawalRequestDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listDriverWithdrawalRequests({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
} = {}): Promise<{
  withdrawalRequests: DriverWithdrawalRequestDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } =
    await httpClientInstance.get<ListDriverWithdrawalRequestsResponse>(
      `/wallet-management/driver/withdrawal-requests`,
      { params: { page, limit } }
    )
  return {
    withdrawalRequests: data.results.driverWalletWithdrawalRequests,
    paginationMeta: data.results.paginationMeta,
  }
}
