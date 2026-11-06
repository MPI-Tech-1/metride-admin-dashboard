"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface CreateInvestorBody {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  address: string
}

interface CreateInvestorResponse {
  message: string
}

export default async function createInvestor(
  payload: CreateInvestorBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateInvestorResponse>(
      `/admins/investment-management/investors`,
      payload
    )
    revalidatePath("/mvest/investors")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create investor. Try again.",
      }
    }
    return { success: false, message: "Could not create investor. Try again." }
  }
}
