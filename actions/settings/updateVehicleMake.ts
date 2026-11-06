"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

interface UpdateVehicleMakeResponse {
  message: string
}

export interface UpdateVehicleMakeBody {
  name: string
}

interface UpdateVehicleMakeArgs {
  identifier: string
  body: UpdateVehicleMakeBody
}

export default async function updateVehicleMake(
  args: UpdateVehicleMakeArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } = await httpClientInstance.patch<UpdateVehicleMakeResponse>(
      `/admins/settings/vehicles/vehicle-makes/${identifier}`,
      body
    )
    revalidatePath("/settings/vehicle-makes")
    revalidatePath("/settings/vehicle-models")
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
