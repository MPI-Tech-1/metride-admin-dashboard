"use server"

import axios from "axios"

import httpClientInstance from "@/actions/http-client"

export interface ResetPasswordBody {
  email: string
  otpToken: string
  newPassword: string
}

interface ResetPasswordResponse {
  status_code: number
  status: string
  message: string
}

export default async function resetPassword(
  payload: ResetPasswordBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<ResetPasswordResponse>(
      `/admins/authentication/reset-password`,
      payload
    )
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not reset password.",
      }
    }
    return { success: false, message: "Could not reset password." }
  }
}
