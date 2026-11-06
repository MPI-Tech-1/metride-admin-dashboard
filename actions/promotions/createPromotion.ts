"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type {
  ApplicableBookingType,
  DiscountType,
} from "@/actions/promotions/listPromotions"

export interface PromotionPayload {
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
}

export interface PromotionMutationResult {
  success: boolean
  message: string
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data?.message ?? fallback
  }
  return fallback
}

export default async function createPromotion(
  payload: PromotionPayload
): Promise<PromotionMutationResult> {
  try {
    const { data } = await httpClientInstance.post<{ message?: string }>(
      "/admins/promotions",
      payload
    )
    revalidatePath("/promotions")
    return {
      success: true,
      message: data.message ?? "Promotion created successfully.",
    }
  } catch (error) {
    return {
      success: false,
      message: apiErrorMessage(error, "Could not create promotion."),
    }
  }
}
