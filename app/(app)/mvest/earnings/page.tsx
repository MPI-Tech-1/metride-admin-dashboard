export const dynamic = "force-dynamic"

import { listEarnings } from "@/actions/mvest/earnings"
import { listOwners } from "@/actions/mvest/owners"
import { EarningsView } from "@/components/app/mvest/earnings-view"
import AppLayout from "@/components/layouts/app-layout"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    ownerIdentifier?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = [10, 20, 30, 40, 50].includes(Number(params.limit))
    ? Number(params.limit)
    : 20
  const [{ earnings, summary, paginationMeta }, { owners }] = await Promise.all([
    listEarnings({
      page,
      limit,
      ownerIdentifier: params.ownerIdentifier,
    }),
    listOwners({ page: 1, limit: 50, status: "active" }),
  ])
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "MVest", href: "#" },
    { title: "Earnings", href: "/mvest/earnings" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <EarningsView
            earnings={earnings}
            summary={summary}
            owners={owners}
            paginationMeta={paginationMeta}
            ownerIdentifier={params.ownerIdentifier ?? ""}
          />
        </div>
      </div>
    </AppLayout>
  )
}
