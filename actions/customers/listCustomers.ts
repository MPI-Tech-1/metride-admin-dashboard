"use server"

import httpClientInstance from "@/actions/http-client"
import PaginationMeta from "@/types/pagination-meta"

export interface ListCustomerDTO {
  identifier: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  lastLoggedInAt: string | null
}

interface ListCustomersResponse {
  status_code: number
  status: string
  message: string
  results: {
    customers: ListCustomerDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listCustomers({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
} = {}): Promise<{
  customers: ListCustomerDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListCustomersResponse>(
    `/customer-management/customers`,
    { params: { page, limit } }
  )
  return {
    customers: data.results.customers,
    paginationMeta: data.results.paginationMeta,
  }
}
