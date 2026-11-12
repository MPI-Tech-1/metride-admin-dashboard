"use server"

import httpClientInstance from "@/actions/http-client"

export interface DriverOnlineRewardSettingsDTO {
  isEnabled: boolean
  /** "HH:mm" in the configured timezone */
  windowStartTime: string
  /** "HH:mm" in the configured timezone */
  windowEndTime: string
  timezone: string
  /** Reward amount in kobo */
  rewardAmount: number
  graceMinutes: number
  acceptanceTimeoutMinutes: number
  updatedAt: string
}

interface GetDriverOnlineRewardSettingsResponse {
  status_code: number
  status: string
  message: string
  results: DriverOnlineRewardSettingsDTO
}

export default async function getDriverOnlineRewardSettings(): Promise<DriverOnlineRewardSettingsDTO> {
  const { data } =
    await httpClientInstance.get<GetDriverOnlineRewardSettingsResponse>(
      "/admins/settings/driver-online-reward"
    )
  return data.results
}
