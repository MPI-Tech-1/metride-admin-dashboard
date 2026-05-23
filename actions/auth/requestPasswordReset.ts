"use server"

import axios from "axios"

import httpClientInstance from "@/actions/http-client"

interface RequestPasswordResetResponse {
  status_code: number
  status: string
  message: string
}

export default async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } =
      await httpClientInstance.post<RequestPasswordResetResponse>(
        `/admins/authentication/request-password-reset`,
        { email }
      )
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not send password reset code.",
      }
    }
    return { success: false, message: "Could not send password reset code." }
  }
}
