"use client"

import { DataTable } from "@/components/ui/data-table"
import { driverColumns } from "@/components/app/driver/driver-table/driver-table-column"
import { ListDriverDTO } from "@/actions/drivers/listDrivers"
import PaginationMeta from "@/types/pagination-meta"

interface DriversTableProps {
  drivers: ListDriverDTO[]
  paginationMeta: PaginationMeta
}

export function DriversTable({ drivers, paginationMeta }: DriversTableProps) {
  return (
    <DataTable
      data={drivers}
      columns={driverColumns}
      paginationMeta={paginationMeta}
      onPageChange={() => console.log("page changed")}
      onPageSizeChange={() => console.log("size changed")}
    />
  )
}
