"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface UpdateCityBody {
  name: string
  longitude: string
  latitude: string
}

interface UpdateCityResponse {
  message: string
}

export default async function updateCity({
  identifier,
  ...payload
}: UpdateCityBody & { identifier: string }): Promise<{
  success: boolean
  message: string
}> {
  try {
    const { data } = await httpClientInstance.patch<UpdateCityResponse>(
      `/settings/cities/${identifier}`,
      payload
    )
    revalidatePath("/settings/cities")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update city. Try again.",
      }
    }
    return { success: false, message: "Could not update city. Try again." }
  }
}
