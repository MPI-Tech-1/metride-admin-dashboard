export const dynamic = "force-dynamic"

import { listAvailableVehicles } from "@/actions/mvest/agreements"
import { listOwners } from "@/actions/mvest/owners"
import { AgreementsView } from "@/components/app/mvest/agreements-view"
import AppLayout from "@/components/layouts/app-layout"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const [{ owners }, vehicles] = await Promise.all([
    listOwners({ page: 1, limit: 50, status: "active" }),
    listAvailableVehicles({ page: 1, limit: 20 }),
  ])
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "MVest", href: "#" },
    { title: "Agreements", href: "/mvest/agreements" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <AgreementsView
            initialOwners={owners}
            initialVehicles={vehicles}
          />
        </div>
      </div>
    </AppLayout>
  )
}
