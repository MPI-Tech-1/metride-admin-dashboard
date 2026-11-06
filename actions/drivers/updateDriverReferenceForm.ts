"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

interface UpdateDriverReferenceFormResponse {
  status_code: number
  status: string
  message: string
  results: {
    driverIdentifier: string
    referenceFormUrl: string
  }
}

export default async function updateDriverReferenceForm({
  driverId,
  referenceFormUrl,
}: {
  driverId: string
  referenceFormUrl: string
}): Promise<{
  success: boolean
  message: string
  referenceFormUrl?: string
}> {
  try {
    const { data } =
      await httpClientInstance.patch<UpdateDriverReferenceFormResponse>(
        `/admins/driver-management/drivers/${driverId}/reference-form`,
        { referenceFormUrl }
      )

    revalidatePath(`/driver/${driverId}`)
    return {
      success: true,
      message: data.message,
      referenceFormUrl: data.results?.referenceFormUrl,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ??
          "Could not update reference form.",
      }
    }
    return {
      success: false,
      message: "Could not update reference form.",
    }
  }
}
