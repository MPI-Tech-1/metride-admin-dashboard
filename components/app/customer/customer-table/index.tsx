"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { customerColumns } from "@/components/app/customer/customer-table/customer-table-column"
import { ListCustomerDTO } from "@/actions/customers/listCustomers"
import PaginationMeta from "@/types/pagination-meta"

interface CustomersTableProps {
  customers: ListCustomerDTO[]
  paginationMeta: PaginationMeta
}

export function CustomersTable({ customers, paginationMeta }: CustomersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(page: number, limit: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    params.set("limit", String(limit))
    router.push(`?${params.toString()}`)
  }

  return (
    <DataTable
      data={customers}
      columns={customerColumns}
      paginationMeta={paginationMeta}
      onPageChange={(page) => navigate(page, paginationMeta.perPage)}
      onPageSizeChange={(limit) => navigate(1, limit)}
    />
  )
}
