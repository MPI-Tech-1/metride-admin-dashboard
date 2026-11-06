"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

interface UpdateDriverCommissionResponse {
  status_code: number
  status: string
  message: string
  results: {
    driverIdentifier: string
    commissionPercentage: number
  }
}

export default async function updateDriverCommission({
  driverId,
  commissionPercentage,
}: {
  driverId: string
  commissionPercentage: number
}): Promise<{
  success: boolean
  message: string
  commissionPercentage?: number
}> {
  try {
    const { data } =
      await httpClientInstance.patch<UpdateDriverCommissionResponse>(
        `/admins/driver-management/drivers/${driverId}/commission`,
        { commissionPercentage: String(commissionPercentage) }
      )

    revalidatePath(`/driver/${driverId}`)
    return {
      success: true,
      message: data.message,
      commissionPercentage: data.results?.commissionPercentage,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update driver commission.",
      }
    }
    return {
      success: false,
      message: "Could not update driver commission.",
    }
  }
}
