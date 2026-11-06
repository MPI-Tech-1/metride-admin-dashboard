export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { InvestorsSection } from "@/components/app/mvest/investors-section"
import listInvestors from "@/actions/mvest/listInvestors"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const { investors } = await listInvestors()

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Mvest", href: "#" },
    { title: "Investors", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Investors</h1>
            <p className="text-sm text-muted-foreground">
              Manage Mvest investors who stake vehicles and earn ride shares.
            </p>
          </div>
          <InvestorsSection investors={investors} />
        </div>
      </div>
    </AppLayout>
  )
}
