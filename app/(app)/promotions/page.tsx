export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { PromotionsView } from "@/components/app/promotions/promotions-view"
import listPromotions from "@/actions/promotions/listPromotions"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = [10, 20, 30, 40, 50].includes(Number(params.limit))
    ? Number(params.limit)
    : 20
  const { promotions, paginationMeta } = await listPromotions({ page, limit })
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Promotions", href: "/promotions" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <PromotionsView
            promotions={promotions}
            paginationMeta={paginationMeta}
          />
        </div>
      </div>
    </AppLayout>
  )
}
