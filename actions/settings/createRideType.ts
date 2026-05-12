"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface CreateRideTypeBody {
  name: string
  description: string
  numberOfSeats: number
  pricePerKilometer: number
  basePrice: number
  minimumPrice: number
}

interface CreateRideTypeResponse {
  message: string
}

export default async function createRideType(
  payload: CreateRideTypeBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateRideTypeResponse>(
      `/settings/booking/ride-types`,
      payload
    )
    revalidatePath("/settings/ride-types")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create ride type.",
      }
    }
    return { success: false, message: "Could not create ride type." }
  }
}
