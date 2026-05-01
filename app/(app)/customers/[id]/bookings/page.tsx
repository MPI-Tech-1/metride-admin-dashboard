export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import CustomerLayout from "@/components/layouts/customer-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import getCustomer from "@/actions/customers/getCustomer"
import listBookings from "@/actions/bookings/listBookings"
import { BookingsTable } from "@/components/app/booking/booking-table"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const [customer, { bookings, paginationMeta }] = await Promise.all([
    getCustomer(id),
    listBookings({ customerIdentifier: id }),
  ])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Customers", href: "/customers" },
    { title: "Customer Details", href: `/customers/${id}` },
    { title: "Bookings", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CustomerLayout
        customerId={id}
        activeTab="bookings"
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          mobileNumber: customer.mobileNumber,
        }}
      >
        <BookingsTable bookings={bookings} paginationMeta={paginationMeta} />
      </CustomerLayout>
    </AppLayout>
  )
}
