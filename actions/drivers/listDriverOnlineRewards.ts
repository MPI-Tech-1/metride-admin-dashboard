"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export interface DriverOnlineRewardDTO {
  identifier: string
  /** YYYY-MM-DD */
  rewardDate: string
  windowStartTime: string
  windowEndTime: string
  onlineMinutes: number
  /** Amount in kobo */
  amount: number
  driver: {
    identifier: string
    fullName: string
    email: string
    mobileNumber: string
  }
  createdAt: string
}

interface ListDriverOnlineRewardsResponse {
  status_code: number
  status: string
  message: string
  results: {
    rewards: DriverOnlineRewardDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listDriverOnlineRewards({
  page = 1,
  limit = 20,
  date,
  driverIdentifier,
}: {
  page?: number
  limit?: number
  /** YYYY-MM-DD */
  date?: string
  driverIdentifier?: string
} = {}): Promise<{
  rewards: DriverOnlineRewardDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } =
    await httpClientInstance.get<ListDriverOnlineRewardsResponse>(
      "/admins/driver-management/drivers/online-rewards",
      {
        params: {
          page,
          limit,
          ...(date ? { date } : {}),
          ...(driverIdentifier ? { driverIdentifier } : {}),
        },
      }
    )
  return {
    rewards: data.results.rewards,
    paginationMeta: data.results.paginationMeta,
  }
}
