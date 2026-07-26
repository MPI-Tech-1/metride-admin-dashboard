"use server"

import axios from "axios"

import httpClientInstance from "@/actions/http-client"

export interface BankDTO {
  identifier: string
  name: string
  bankCode: string
}

export async function listBanks(): Promise<BankDTO[]> {
  const { data } = await httpClientInstance.get<{ results: BankDTO[] }>(
    "/common/finance/banks"
  )
  return data.results
}

export async function resolveBankAccount({
  accountNumber,
  bankCode,
}: {
  accountNumber: string
  bankCode: string
}): Promise<{
  success: boolean
  message: string
  accountName?: string
  accountNumber?: string
}> {
  try {
    const { data } = await httpClientInstance.get<{
      message?: string
      results: { accountName: string; accountNumber: string }
    }>("/common/finance/resolve-accounts", {
      params: { accountNumber, bankCode },
    })
    return {
      success: true,
      message: data.message ?? "Account resolved.",
      ...data.results,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not resolve account.",
      }
    }
    return { success: false, message: "Could not resolve account." }
  }
}
