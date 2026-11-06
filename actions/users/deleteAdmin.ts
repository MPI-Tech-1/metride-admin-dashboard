"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

interface DeleteAdminResponse {
  status_code: number
  status: string
  message: string
}

export default async function deleteAdmin(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.delete<DeleteAdminResponse>(
      `/admins/user-management/${identifier}`
    )
    revalidatePath("/user-management")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not delete admin account.",
      }
    }
    return { success: false, message: "Could not delete admin account." }
  }
}
