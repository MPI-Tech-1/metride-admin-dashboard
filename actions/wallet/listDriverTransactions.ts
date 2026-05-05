"use server"

import httpClientInstance from "@/actions/http-client"
import PaginationMeta from "@/types/pagination-meta"

export interface DriverWalletTransactionDTO {
  identifier: string
  amount: number
  typeOfTransaction: "debit" | "credit"
  status: "pending" | "completed" | "failed"
  driver: {
    identifier: string
    fullName: string
  }
  remark: string
  systemGeneratedTransactionReference: string
  providerTransactionReference: string | null
  createdAt: string
}

interface ListDriverTransactionsResponse {
  status_code: number
  status: string
  message: string
  results: {
    driverWalletTransactions: DriverWalletTransactionDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listDriverTransactions({
  page = 1,
  limit = 10,
  driverIdentifier,
  typeOfTransaction,
}: {
  page?: number
  limit?: number
  driverIdentifier?: string
  typeOfTransaction?: "credit" | "debit"
} = {}): Promise<{
  transactions: DriverWalletTransactionDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListDriverTransactionsResponse>(
    `/wallet-management/driver/transactions`,
    {
      params: {
        page,
        limit,
        ...(driverIdentifier ? { driverIdentifier } : {}),
        ...(typeOfTransaction ? { typeOfTransaction } : {}),
      },
    }
  )
  return {
    transactions: data.results.driverWalletTransactions,
    paginationMeta: data.results.paginationMeta,
  }
}
