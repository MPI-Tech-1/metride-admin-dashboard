"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { driverColumns } from "@/components/app/driver/driver-table/driver-table-column"
import { ListDriverDTO } from "@/actions/drivers/listDrivers"
import PaginationMeta from "@/types/pagination-meta"

interface DriversTableProps {
  drivers: ListDriverDTO[]
  paginationMeta: PaginationMeta
}

export function DriversTable({ drivers, paginationMeta }: DriversTableProps) {
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
      data={drivers}
      columns={driverColumns}
      paginationMeta={paginationMeta}
      onPageChange={(page) => navigate(page, paginationMeta.perPage)}
      onPageSizeChange={(limit) => navigate(1, limit)}
    />
  )
}
