"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface CreateInvestorVehicleBody {
  investorIdentifier: string
  rideTypeIdentifier: string
  vehicleMakeIdentifier: string
  vehicleModelIdentifier: string
  colorOfVehicle: string
  plateNumber: string
  seatCapacity: string
  percentageShare: number
}

interface CreateInvestorVehicleResponse {
  message: string
}

export default async function createInvestorVehicle(
  payload: CreateInvestorVehicleBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateInvestorVehicleResponse>(
      `/admins/investment-management/investor-vehicles`,
      payload
    )
    revalidatePath("/mvest/investor-vehicles")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ??
          "Could not create investor vehicle. Try again.",
      }
    }
    return {
      success: false,
      message: "Could not create investor vehicle. Try again.",
    }
  }
}
