"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdatePopularLocationBody {
  cityIdentifier: string
  name: string
  gpsCoordinates: string
  typeOfLocation: string
  isActive: boolean
}

interface UpdatePopularLocationResponse {
  message: string
}

interface UpdatePopularLocationArgs {
  identifier: string
  body: UpdatePopularLocationBody
}

export default async function updatePopularLocation(
  args: UpdatePopularLocationArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } =
      await httpClientInstance.patch<UpdatePopularLocationResponse>(
        `/admins/settings/booking/popular-locations/${identifier}`,
        body
      )
    revalidatePath("/settings/popular-locations")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ??
          "Could not update popular location.",
      }
    }
    return { success: false, message: "Could not update popular location." }
  }
}
