export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import DriverLayout from "@/components/layouts/driver-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import getDriver from "@/actions/drivers/getDriver"
import listBookings from "@/actions/bookings/listBookings"
import { BookingsTable } from "@/components/app/booking/booking-table"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const [driver, { bookings, paginationMeta }] = await Promise.all([
    getDriver(id),
    listBookings({ assignedDriverIdentifier: id }),
  ])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Drivers", href: "/driver" },
    { title: "Driver Details", href: `/driver/${id}` },
    { title: "Bookings", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DriverLayout
        driverId={id}
        activeTab="bookings"
        driver={{
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          mobileNumber: driver.mobileNumber,
          status: driver.status,
          driverDocument: driver.driverDocument,
        }}
      >
        <BookingsTable bookings={bookings} paginationMeta={paginationMeta} />
      </DriverLayout>
    </AppLayout>
  )
}
