"use server"

import httpClientInstance from "@/actions/http-client"

export interface CustomerDetailDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  lastLoggedInAt: string | null
}

interface GetCustomerResponse {
  status_code: number
  status: string
  message: string
  results: CustomerDetailDTO
}

export default async function getCustomer(
  identifier: string
): Promise<CustomerDetailDTO> {
  const { data } = await httpClientInstance.get<GetCustomerResponse>(
    `/customer-management/customers/${identifier}`
  )
  return data.results
}
