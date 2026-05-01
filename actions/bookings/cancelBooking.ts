"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export default async function cancelBooking(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch(
      `/bookings/${identifier}/cancel`
    )
    revalidatePath("/booking")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Failed to cancel booking.",
      }
    }
    return { success: false, message: "Failed to cancel booking." }
  }
}
