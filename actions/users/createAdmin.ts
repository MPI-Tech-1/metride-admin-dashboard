"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"
import type { Role } from "@/lib/permissions"

export interface CreateAdminBody {
  firstName: string
  lastName: string
  email: string
  role: Role
}

interface CreateAdminResponse {
  status_code: number
  status: string
  message: string
  results: {
    identifier: string
    firstName: string
    lastName: string
    email: string
    role: Role
  }
}

export default async function createAdmin(
  payload: CreateAdminBody
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.post<CreateAdminResponse>(
      `/admins/user-management`,
      payload
    )
    revalidatePath("/user-management")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ?? "Could not create admin account.",
      }
    }
    return { success: false, message: "Could not create admin account." }
  }
}
