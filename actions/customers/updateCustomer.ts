"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

export interface UpdateCustomerPayload {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
}

export default async function updateCustomer(
  customerIdentifier: string,
  payload: UpdateCustomerPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch<{ message?: string }>(
      `/admins/customer-management/customers/${customerIdentifier}`,
      payload
    )
    revalidatePath(`/customers/${customerIdentifier}`, "layout")
    return {
      success: true,
      message: data.message ?? "Customer information updated successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not update customer.",
      }
    }
    return { success: false, message: "Could not update customer." }
  }
}
