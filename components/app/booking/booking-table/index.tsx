"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { bookingColumns } from "@/components/app/booking/booking-table/booking-table-column"
import { ListBookingDTO } from "@/actions/bookings/listBookings"
import PaginationMeta from "@/types/pagination-meta"

interface BookingsTableProps {
  bookings: ListBookingDTO[]
  paginationMeta: PaginationMeta
}

export function BookingsTable({ bookings, paginationMeta }: BookingsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(page: number, limit: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    params.set("limit", String(limit))
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const currentLimit = Number(searchParams.get("limit")) || 50

  return (
    <DataTable
      data={bookings}
      columns={bookingColumns}
      onRowClick={(booking) => router.push(`/booking/${booking.identifier}`)}
      initialColumnVisibility={{
        "Trip Progress": false,
        "Ride Type": false,
        Departure: false,
        Destination: false,
        "Assigned Driver": false,
        Recurring: false,
        "Date of Ride": false,
      }}
      paginationMeta={paginationMeta}
      onPageChange={(page) => navigate(page, currentLimit)}
      onPageSizeChange={(limit) => navigate(1, limit)}
    />
  )
}
