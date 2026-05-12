"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface UpdateVehicleModelResponse {
  message: string
}

export default async function updateVehicleModel({
  identifier,
  ...payload
}: {
  identifier: string
  name: string
  vehicleMakeIdentifier: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch<UpdateVehicleModelResponse>(
      `/settings/vehicles/vehicle-models/${identifier}`,
      payload
    )
    revalidatePath("/settings/vehicle-models")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update vehicle model.",
      }
    }
    return { success: false, message: "Could not update vehicle model." }
  }
}
