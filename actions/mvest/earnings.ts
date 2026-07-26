"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export interface MvestEarningDTO {
  identifier: string
  eligibleAmount: number
  commissionPercentage: number
  commissionAmount: number
  status: "pending" | "paid" | string
  paidAt: string | null
  createdAt: string
  owner: {
    identifier: string
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    status: string
  }
  agreement: { identifier: string }
  vehicle: {
    identifier: string
    plateNumber: string
    color: string
    make: string
    model: string
    rideType: string
  }
  driver: {
    identifier: string
    firstName: string
    lastName: string
  }
  booking: {
    identifier: string
    type: string
    status: string
    dateOfRide: string
    departureLocationName: string
    destinationLocationName: string
  }
}

export interface MvestEarningsSummary {
  totalRecords: number
  totalEligibleAmount: number
  totalCommissionAmount: number
  pendingAmount: number
  paidAmount: number
}

interface EarningsApiMeta {
  total: number
  page: number
  perPage: number
  lastPage: number
}

export async function listEarnings({
  page = 1,
  limit = 20,
  ownerIdentifier,
}: {
  page?: number
  limit?: number
  ownerIdentifier?: string
} = {}): Promise<{
  earnings: MvestEarningDTO[]
  summary: MvestEarningsSummary
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<{
    results: MvestEarningDTO[]
    summary: MvestEarningsSummary
    meta: EarningsApiMeta
  }>("/admins/mvest/earnings", {
    params: {
      page,
      limit,
      ...(ownerIdentifier ? { ownerIdentifier } : {}),
    },
  })
  return {
    earnings: data.results,
    summary: data.summary,
    paginationMeta: {
      total: data.meta.total,
      perPage: data.meta.perPage,
      currentPage: data.meta.page,
      lastPage: data.meta.lastPage,
      firstPage: 1,
      firstPageUrl: "/?page=1",
      lastPageUrl: `/?page=${data.meta.lastPage}`,
      nextPageUrl:
        data.meta.page < data.meta.lastPage
          ? `/?page=${data.meta.page + 1}`
          : null,
      previousPageUrl:
        data.meta.page > 1 ? `/?page=${data.meta.page - 1}` : null,
    },
  }
}

export async function markEarningPaid(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<{ message?: string }>(
      `/admins/mvest/earnings/${identifier}/mark-paid`
    )
    revalidatePath("/mvest/earnings")
    return {
      success: true,
      message: data.message ?? "MVest earning marked as paid.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not mark earning as paid.",
      }
    }
    return { success: false, message: "Could not mark earning as paid." }
  }
}
