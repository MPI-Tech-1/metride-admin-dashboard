"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export type DiscountType = "percentage" | "fixed"
export type ApplicableBookingType = "all" | "instant" | "shuttle"

export interface PromotionDTO {
  id: number
  identifier: string
  code: string
  name: string
  description: string
  discountType: DiscountType
  discountValue: number
  maximumDiscountAmount: number | null
  minimumBookingAmount: number
  globalUsageLimit: number
  usageLimitPerCustomer: number
  applicableBookingType: ApplicableBookingType
  startsAt: string
  endsAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface ListPromotionsResponse {
  status: string
  status_code: number
  results: PromotionDTO[]
  meta: PaginationMeta
}

export default async function listPromotions({
  page = 1,
  limit = 20,
}: {
  page?: number
  limit?: number
} = {}): Promise<{
  promotions: PromotionDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListPromotionsResponse>(
    "/admins/promotions",
    { params: { page, limit } }
  )

  return {
    promotions: data.results,
    paginationMeta: data.meta,
  }
}
