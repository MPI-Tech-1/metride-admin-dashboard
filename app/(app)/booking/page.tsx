export const dynamic = "force-dynamic"

import { Suspense } from "react"
import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { BookingSectionCards } from "@/components/app/booking/section-cards"
import { BookingsTable } from "@/components/app/booking/booking-table"
import listBookings from "@/actions/bookings/listBookings"
import getBookingMetrics from "@/actions/dashboard/getBookingMetrics"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Bookings",
      href: "#",
    },
  ]

  const { page: pageParam, limit: limitParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = Number(limitParam) || 50

  const [{ bookings, paginationMeta }, metrics] = await Promise.all([
    listBookings({ page, limit }),
    getBookingMetrics(),
  ])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all customer ride bookings.
            </p>
          </div>
          <BookingSectionCards metrics={metrics} />
          <Suspense>
            <BookingsTable bookings={bookings} paginationMeta={paginationMeta} />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
