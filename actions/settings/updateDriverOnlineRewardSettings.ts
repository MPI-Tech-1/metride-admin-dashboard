"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type { DriverOnlineRewardSettingsDTO } from "@/actions/settings/getDriverOnlineRewardSettings"

export interface UpdateDriverOnlineRewardSettingsBody {
  isEnabled: boolean
  windowStartTime: string
  windowEndTime: string
  /** Reward amount in kobo */
  rewardAmount: number
  graceMinutes: number
  acceptanceTimeoutMinutes: number
}

interface UpdateDriverOnlineRewardSettingsResponse {
  message?: string
  results: DriverOnlineRewardSettingsDTO
}

export type UpdateDriverOnlineRewardSettingsResult =
  | { success: true; message: string; settings: DriverOnlineRewardSettingsDTO }
  | { success: false; message: string }

const FALLBACK_ERROR = "Could not update driver online reward settings."

export default async function updateDriverOnlineRewardSettings(
  body: UpdateDriverOnlineRewardSettingsBody
): Promise<UpdateDriverOnlineRewardSettingsResult> {
  try {
    const { data } =
      await httpClientInstance.put<UpdateDriverOnlineRewardSettingsResponse>(
        "/admins/settings/driver-online-reward",
        body
      )
    revalidatePath("/settings/driver-online-reward")
    return {
      success: true,
      message: data.message ?? "Driver online reward settings updated.",
      settings: data.results,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? FALLBACK_ERROR,
      }
    }
    return { success: false, message: FALLBACK_ERROR }
  }
}
