"use client"

import { DataTable } from "@/components/ui/data-table"
import { customerColumns } from "@/components/app/customer/customer-table/customer-table-column"
import { ListCustomerDTO } from "@/actions/customers/listCustomers"
import PaginationMeta from "@/types/pagination-meta"

interface CustomersTableProps {
  customers: ListCustomerDTO[]
  paginationMeta: PaginationMeta
}

export function CustomersTable({ customers, paginationMeta }: CustomersTableProps) {
  return (
    <DataTable
      data={customers}
      columns={customerColumns}
      paginationMeta={paginationMeta}
      onPageChange={() => console.log("page changed")}
      onPageSizeChange={() => console.log("size changed")}
    />
  )
}
