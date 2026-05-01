"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export default async function completeBooking(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch(
      `/bookings/${identifier}/complete`
    )
    revalidatePath("/booking")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Failed to complete booking.",
      }
    }
    return { success: false, message: "Failed to complete booking." }
  }
}
