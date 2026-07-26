"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export type OwnerStatus = "active" | "inactive"

export interface MvestOwnerDTO {
  id: number
  identifier: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  status: OwnerStatus
  bankName: string
  accountName: string
  accountNumber: string
  lastLoggedInAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateOwnerPayload {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  password: string
  status: OwnerStatus
  bankName: string
  accountName: string
  accountNumber: string
}

interface OwnersResponse {
  results: MvestOwnerDTO[]
  meta: PaginationMeta
}

export async function listOwners({
  page = 1,
  limit = 20,
  status,
  search,
}: {
  page?: number
  limit?: number
  status?: OwnerStatus
  search?: string
} = {}): Promise<{
  owners: MvestOwnerDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<OwnersResponse>(
    "/admins/mvest/owners",
    {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }
  )
  return { owners: data.results, paginationMeta: data.meta }
}

export async function createOwner(
  payload: CreateOwnerPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<{ message?: string }>(
      "/admins/mvest/owners",
      payload
    )
    revalidatePath("/mvest/owners")
    return {
      success: true,
      message: data.message ?? "MVest owner created successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not create owner.",
      }
    }
    return { success: false, message: "Could not create owner." }
  }
}
