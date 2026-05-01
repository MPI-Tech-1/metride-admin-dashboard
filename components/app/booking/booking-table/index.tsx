"use client"

import { DataTable } from "@/components/ui/data-table"
import { bookingColumns } from "@/components/app/booking/booking-table/booking-table-column"
import { ListBookingDTO } from "@/actions/bookings/listBookings"
import PaginationMeta from "@/types/pagination-meta"

interface BookingsTableProps {
  bookings: ListBookingDTO[]
  paginationMeta: PaginationMeta
}

export function BookingsTable({ bookings, paginationMeta }: BookingsTableProps) {
  return (
    <DataTable
      data={bookings}
      columns={bookingColumns}
      paginationMeta={paginationMeta}
      onPageChange={() => console.log("page changed")}
      onPageSizeChange={() => console.log("size changed")}
    />
  )
}
