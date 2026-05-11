"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface CreatePopularLocationBody {
  cityIdentifier: string
  name: string
  gpsCoordinates: string
  typeOfLocation: string
  isActive: boolean
}

interface CreatePopularLocationResponse {
  message: string
}

export default async function createPopularLocation(
  payload: CreatePopularLocationBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreatePopularLocationResponse>(
      `/settings/booking/popular-locations`,
      payload
    )
    revalidatePath("/settings/popular-locations")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ??
          "Could not create popular location.",
      }
    }
    return { success: false, message: "Could not create popular location." }
  }
}
