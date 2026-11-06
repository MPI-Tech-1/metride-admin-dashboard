export const dynamic = "force-dynamic"

import { listBanks } from "@/actions/mvest/finance"
import { listOwners, type OwnerStatus } from "@/actions/mvest/owners"
import AppLayout from "@/components/layouts/app-layout"
import { OwnersView } from "@/components/app/mvest/owners-view"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    status?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = [10, 20, 30, 40, 50].includes(Number(params.limit))
    ? Number(params.limit)
    : 20
  const status =
    params.status === "active" || params.status === "inactive"
      ? (params.status as OwnerStatus)
      : undefined
  const [{ owners, paginationMeta }, banks] = await Promise.all([
    listOwners({ page, limit, status, search: params.search }),
    listBanks(),
  ])
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "MVest", href: "#" },
    { title: "Owners", href: "/mvest/owners" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <OwnersView
            owners={owners}
            banks={banks}
            paginationMeta={paginationMeta}
            initialSearch={params.search ?? ""}
            initialStatus={status ?? ""}
          />
        </div>
      </div>
    </AppLayout>
  )
}
