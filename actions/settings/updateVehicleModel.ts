"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface UpdateVehicleModelResponse {
  message: string
}

export interface UpdateVehicleModelBody {
  name: string
  vehicleMakeIdentifier: string
}

interface UpdateVehicleModelArgs {
  identifier: string
  body: UpdateVehicleModelBody
}

export default async function updateVehicleModel(
  args: UpdateVehicleModelArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } = await httpClientInstance.patch<UpdateVehicleModelResponse>(
      `/admins/settings/vehicles/vehicle-models/${identifier}`,
      body
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
