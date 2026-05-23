"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export interface ActiveDriverDTO {
  identifier: string
  fullName: string
  currentLocation: {
    latitude: string
    longitude: string
  }
}

interface ListActiveDriversResponse {
  status_code: number
  status: string
  message: string
  results: {
    drivers: ActiveDriverDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listActiveDrivers({
  page = 1,
  limit = 100,
}: {
  page?: number
  limit?: number
} = {}): Promise<{
  drivers: ActiveDriverDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListActiveDriversResponse>(
    `/admins/driver-management/drivers/active`,
    { params: { page, limit } }
  )
  return {
    drivers: data.results.drivers,
    paginationMeta: data.results.paginationMeta,
  }
}
