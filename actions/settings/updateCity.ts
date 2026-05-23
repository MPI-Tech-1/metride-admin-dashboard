"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdateCityBody {
  name: string
  longitude: string
  latitude: string
}

interface UpdateCityResponse {
  message: string
}

interface UpdateCityArgs {
  identifier: string
  body: UpdateCityBody
}

export default async function updateCity(
  args: UpdateCityArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } = await httpClientInstance.patch<UpdateCityResponse>(
      `/admins/settings/cities/${identifier}`,
      body
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
