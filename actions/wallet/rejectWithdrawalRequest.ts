"use server"

import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"
import { AxiosError } from "axios"

export default async function rejectWithdrawalRequest(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post(
      `/wallet-management/driver/withdrawal-requests/${identifier}/reject`
    )
    revalidatePath("/wallet/payouts")
    return {
      success: true,
      message: data.message ?? "Withdrawal request rejected.",
    }
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return {
      success: false,
      message:
        axiosErr.response?.data?.message ??
        "Failed to reject withdrawal request.",
    }
  }
}
