"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export default async function rejectDriver({
  driverId,
  reason,
}: {
  driverId: string
  reason: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post(
      `/driver-management/drivers/${driverId}/reject`,
      { reason }
    )

    revalidatePath(`/driver/${driverId}`)
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data?.message ?? "Failed to reject driver." }
    }
    return { success: false, message: "Failed to reject driver." }
  }
}
