"use server"

import httpClientInstance from "@/actions/http-client"
import PaginationMeta from "@/types/pagination-meta"

export interface ListDriverDTO {
  identifier: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  status: "pending" | "approved" | "rejected"
  lastLoggedInAt: string | null
}

interface ListDriversResponse {
  status_code: number
  status: string
  message: string
  results: {
    drivers: ListDriverDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listDrivers({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
} = {}): Promise<{ drivers: ListDriverDTO[]; paginationMeta: PaginationMeta }> {
  try {
    const { data } = await httpClientInstance.get<ListDriversResponse>(
      `/driver-management/drivers`,
      { params: { page, limit } }
    )
    return {
      drivers: data.results.drivers,
      paginationMeta: data.results.paginationMeta,
    }
  } catch (listDriversError) {
    throw listDriversError
  }
}
