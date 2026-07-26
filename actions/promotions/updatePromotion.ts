"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type { PromotionPayload } from "@/actions/promotions/createPromotion"
import type { PromotionMutationResult } from "@/actions/promotions/createPromotion"

export default async function updatePromotion(
  identifier: string,
  payload: Partial<PromotionPayload>
): Promise<PromotionMutationResult> {
  try {
    const { data } = await httpClientInstance.patch<{ message?: string }>(
      `/admins/promotions/${identifier}`,
      payload
    )
    revalidatePath("/promotions")
    return {
      success: true,
      message: data.message ?? "Promotion updated successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update promotion.",
      }
    }
    return { success: false, message: "Could not update promotion." }
  }
}
