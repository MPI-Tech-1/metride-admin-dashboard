"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface CreateVehicleModelResponse {
  message: string
}

export default async function createVehicleModel(payload: {
  name: string
  vehicleMakeIdentifier: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateVehicleModelResponse>(
      `/settings/vehicles/vehicle-models`,
      payload
    )
    revalidatePath("/settings/vehicle-models")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create vehicle model.",
      }
    }
    return { success: false, message: "Could not create vehicle model." }
  }
}
