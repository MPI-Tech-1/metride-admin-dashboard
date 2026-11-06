"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export interface InvestorDTO {
  identifier: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  mobileNumber: string
  address: string
  createdAt: string
}

interface ListInvestorsResponse {
  status_code: number
  status: string
  message: string
  results: {
    investors: InvestorDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listInvestors(
  page = 1,
  limit = 100
): Promise<{ investors: InvestorDTO[]; paginationMeta: PaginationMeta }> {
  const { data } = await httpClientInstance.get<ListInvestorsResponse>(
    `/admins/investment-management/investors`,
    { params: { page, limit } }
  )
  return data.results
}
