"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface UpdateVehicleMakeResponse {
  message: string
}

export default async function updateVehicleMake({
  identifier,
  ...payload
}: {
  identifier: string
  name: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch<UpdateVehicleMakeResponse>(
      `/settings/vehicles/vehicle-makes/${identifier}`,
      payload
    )
    revalidatePath("/settings/vehicles")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update vehicle make.",
      }
    }
    return { success: false, message: "Could not update vehicle make." }
  }
}
