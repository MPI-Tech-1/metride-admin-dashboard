"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdateInvestorBody {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  address: string
}

interface UpdateInvestorResponse {
  message: string
}

interface UpdateInvestorArgs {
  identifier: string
  body: UpdateInvestorBody
}

export default async function updateInvestor(
  args: UpdateInvestorArgs
): Promise<{ success: boolean; message: string }> {
  const { identifier, body } = args
  try {
    const { data } = await httpClientInstance.patch<UpdateInvestorResponse>(
      `/admins/investment-management/investors/${identifier}`,
      body
    )
    revalidatePath("/mvest/investors")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not update investor. Try again.",
      }
    }
    return { success: false, message: "Could not update investor. Try again." }
  }
}
