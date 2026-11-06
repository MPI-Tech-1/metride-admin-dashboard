"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type {
  VehiclePhotoDTO,
  VehiclePhotoSection,
} from "@/actions/vehicles/listDriverVehiclePhotos"

interface AddVehiclePhotoResponse {
  status_code: number
  status: string
  message: string
  results: VehiclePhotoDTO
}

export default async function addDriverVehiclePhoto({
  driverIdentifier,
  section,
  photoUrl,
}: {
  driverIdentifier: string
  section: VehiclePhotoSection
  photoUrl: string
}): Promise<{
  success: boolean
  message: string
  photo?: VehiclePhotoDTO
}> {
  try {
    const { data } = await httpClientInstance.post<AddVehiclePhotoResponse>(
      `/admins/vehicle-management/vehicle-photos`,
      { driverIdentifier, section, photoUrl }
    )

    revalidatePath(`/driver/${driverIdentifier}`)
    return {
      success: true,
      message: data.message,
      photo: data.results,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not add vehicle photo.",
      }
    }
    return { success: false, message: "Could not add vehicle photo." }
  }
}
