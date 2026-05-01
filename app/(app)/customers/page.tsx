export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { CustomerSectionCards } from "@/components/app/customer/section-cards"
import { CustomersTable } from "@/components/app/customer/customer-table"
import listCustomers from "@/actions/customers/listCustomers"

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Customers",
      href: "#",
    },
  ]

  const { customers, paginationMeta } = await listCustomers()

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all registered customer accounts.
            </p>
          </div>
          <CustomerSectionCards />
          <CustomersTable customers={customers} paginationMeta={paginationMeta} />
        </div>
      </div>
    </AppLayout>
  )
}
