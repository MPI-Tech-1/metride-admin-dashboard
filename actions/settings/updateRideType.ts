"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdateRideTypeBody {
  name: string
  description: string
  numberOfSeats: number
  pricePerKilometer: number
  basePrice: number
  minimumPrice: number
}

interface UpdateRideTypeResponse {
  message: string
}

export default async function updateRideType({
  identifier,
  ...payload
}: UpdateRideTypeBody & { identifier: string }): Promise<{
  success: boolean
  message: string
}> {
  try {
    const { data } = await httpClientInstance.patch<UpdateRideTypeResponse>(
      `/settings/booking/ride-types/${identifier}`,
      payload
    )
    revalidatePath("/settings/ride-types")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update ride type.",
      }
    }
    return { success: false, message: "Could not update ride type." }
  }
}
