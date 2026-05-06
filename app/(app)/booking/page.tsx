export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { BookingSectionCards } from "@/components/app/booking/section-cards"
import { BookingsTable } from "@/components/app/booking/booking-table"
import listBookings from "@/actions/bookings/listBookings"
import getBookingMetrics from "@/actions/dashboard/getBookingMetrics"

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Bookings",
      href: "#",
    },
  ]

  const [{ bookings, paginationMeta }, metrics] = await Promise.all([
    listBookings(),
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
          <BookingsTable bookings={bookings} paginationMeta={paginationMeta} />
        </div>
      </div>
    </AppLayout>
  )
}
