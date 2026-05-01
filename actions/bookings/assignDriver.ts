"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface AssignDriverError {
  message: string
  rule: string
  field: string
}

export default async function assignDriver({
  bookingIdentifier,
  driverIdentifier,
}: {
  bookingIdentifier: string
  driverIdentifier: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch(
      `/bookings/${bookingIdentifier}/assign-driver`,
      { driverIdentifier }
    )
    revalidatePath("/booking")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data
      if (Array.isArray(body?.results) && body.results.length > 0) {
        const first = body.results[0] as AssignDriverError
        return { success: false, message: first.message }
      }
      return {
        success: false,
        message: body?.message ?? "Failed to assign driver.",
      }
    }
    return { success: false, message: "Failed to assign driver." }
  }
}
