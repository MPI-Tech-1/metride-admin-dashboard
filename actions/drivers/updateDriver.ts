"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

export interface UpdateDriverPayload {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  cityIdentifier?: string
  dateOfBirth?: string
  gender?: string
  homeAddress?: string
  nationalIdentificationNumber?: string
}

export default async function updateDriver(
  driverIdentifier: string,
  payload: UpdateDriverPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch<{ message?: string }>(
      `/admins/driver-management/drivers/${driverIdentifier}`,
      payload
    )
    revalidatePath(`/driver/${driverIdentifier}`)
    return {
      success: true,
      message: data.message ?? "Driver information updated successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not update driver.",
      }
    }
    return { success: false, message: "Could not update driver." }
  }
}
