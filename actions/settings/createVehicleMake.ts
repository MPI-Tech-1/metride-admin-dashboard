"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface CreateVehicleMakeResponse {
  message: string
}

export default async function createVehicleMake(payload: {
  name: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateVehicleMakeResponse>(
      `/admins/settings/vehicles/vehicle-makes`,
      payload
    )
    revalidatePath("/settings/vehicle-makes")
    revalidatePath("/settings/vehicle-models")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create vehicle make.",
      }
    }
    return { success: false, message: "Could not create vehicle make." }
  }
}
