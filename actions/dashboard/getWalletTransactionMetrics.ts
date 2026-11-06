"use server"

import httpClientInstance from "@/actions/http-client"

export interface WalletTransactionMetrics {
  totalCreditTransactionsForPastMonth: number
  totalDebitTransactionsForPastMonth: number
  totalCreditAmountForPastMonth: number
  totalDebitAmountForPastMonth: number
}

interface GetWalletTransactionMetricsResponse {
  status_code: number
  status: string
  message: string
  results: WalletTransactionMetrics
}

export default async function getWalletTransactionMetrics(): Promise<WalletTransactionMetrics> {
  const { data } =
    await httpClientInstance.get<GetWalletTransactionMetricsResponse>(
      `/admins/dashboard/wallet-transaction-metrics`
    )
  return data.results
}
