"use client"

import { DataTable } from "@/components/ui/data-table"
import { driverTransactionColumns } from "@/components/app/wallet/driver-transactions-table/driver-transactions-column"
import { DriverWalletTransactionDTO } from "@/actions/wallet/listDriverTransactions"
import PaginationMeta from "@/types/pagination-meta"

interface DriverTransactionsTableProps {
  transactions: DriverWalletTransactionDTO[]
  paginationMeta: PaginationMeta
}

export function DriverTransactionsTable({
  transactions,
  paginationMeta,
}: DriverTransactionsTableProps) {
  return (
    <DataTable
      data={transactions}
      columns={driverTransactionColumns}
      paginationMeta={paginationMeta}
      onPageChange={() => console.log("page changed")}
      onPageSizeChange={() => console.log("size changed")}
    />
  )
}
