"use server"

import httpClientInstance from "@/actions/http-client"
import type { Role } from "@/lib/permissions"
import PaginationMeta from "@/types/pagination-meta"

export interface AdminListItemDTO {
  identifier: string
  firstName: string
  lastName: string
  email: string
  role: Role
  createdAt: string
}

interface ListAdminsResponse {
  status_code: number
  status: string
  message: string
  results: {
    admins: AdminListItemDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listAdmins({
  page = 1,
  limit = 10,
  searchQuery,
}: {
  page?: number
  limit?: number
  searchQuery?: string
} = {}): Promise<{
  admins: AdminListItemDTO[]
  paginationMeta: PaginationMeta
}> {
  const params: Record<string, string | number> = { page, limit }
  const trimmedQuery = searchQuery?.trim()
  if (trimmedQuery) {
    params.searchQuery = trimmedQuery
  }

  const { data } = await httpClientInstance.get<ListAdminsResponse>(
    `/admins/user-management`,
    { params }
  )

  return {
    admins: data.results.admins,
    paginationMeta: data.results.paginationMeta,
  }
}
