"use client"

import { DataTable } from "@/components/ui/data-table"
import { payoutsColumns } from "@/components/app/wallet/payouts-table/payouts-column"
import { DriverWithdrawalRequestDTO } from "@/actions/wallet/listDriverWithdrawalRequests"
import PaginationMeta from "@/types/pagination-meta"

interface PayoutsTableProps {
  withdrawalRequests: DriverWithdrawalRequestDTO[]
  paginationMeta: PaginationMeta
}

export function PayoutsTable({
  withdrawalRequests,
  paginationMeta,
}: PayoutsTableProps) {
  return (
    <DataTable
      data={withdrawalRequests}
      columns={payoutsColumns}
      paginationMeta={paginationMeta}
      onPageChange={() => console.log("page changed")}
      onPageSizeChange={() => console.log("size changed")}
    />
  )
}
