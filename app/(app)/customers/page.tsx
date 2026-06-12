export const dynamic = "force-dynamic"

import { Suspense } from "react"
import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { CustomerSectionCards } from "@/components/app/customer/section-cards"
import { CustomersTable } from "@/components/app/customer/customer-table"
import listCustomers from "@/actions/customers/listCustomers"
import getCustomerMetrics from "@/actions/dashboard/getCustomerMetrics"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Customers",
      href: "#",
    },
  ]

  const { page: pageParam, limit: limitParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = Number(limitParam) || 50

  const [{ customers, paginationMeta }, metrics] = await Promise.all([
    listCustomers({ page, limit }),
    getCustomerMetrics(),
  ])

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
          <CustomerSectionCards metrics={metrics} />
          <Suspense>
            <CustomersTable customers={customers} paginationMeta={paginationMeta} />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}
