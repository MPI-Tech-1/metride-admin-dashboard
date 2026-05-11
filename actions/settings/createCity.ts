"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface CreateCityBody {
  name: string
  longitude: string
  latitude: string
}

interface CreateCityResponse {
  message: string
}

export default async function createCity(
  payload: CreateCityBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateCityResponse>(
      `/settings/cities`,
      payload
    )
    revalidatePath("/settings/cities")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create city. Try again.",
      }
    }
    return { success: false, message: "Could not create city. Try again." }
  }
}
