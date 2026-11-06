"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdateInvestorVehicleBody {
  investorIdentifier: string
  rideTypeIdentifier: string
  vehicleMakeIdentifier: string
  vehicleModelIdentifier: string
  colorOfVehicle: string
  plateNumber: string
  seatCapacity: string
  percentageShare: number
}

interface UpdateInvestorVehicleResponse {
  message: string
}

interface UpdateInvestorVehicleArgs {
  identifier: string
  body: UpdateInvestorVehicleBody
}

export default async function updateInvestorVehicle(
  args: UpdateInvestorVehicleArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } = await httpClientInstance.patch<UpdateInvestorVehicleResponse>(
      `/admins/investment-management/investor-vehicles/${identifier}`,
      body
    )
    revalidatePath("/mvest/investor-vehicles")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ??
          "Could not update investor vehicle. Try again.",
      }
    }
    return {
      success: false,
      message: "Could not update investor vehicle. Try again.",
    }
  }
}
