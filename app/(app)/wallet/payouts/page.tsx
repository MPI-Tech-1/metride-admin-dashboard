export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { PayoutsTable } from "@/components/app/wallet/payouts-table"
import listDriverWithdrawalRequests from "@/actions/wallet/listDriverWithdrawalRequests"

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Wallet Transactions", href: "#" },
    { title: "Payouts", href: "#" },
  ]

  const { withdrawalRequests, paginationMeta } =
    await listDriverWithdrawalRequests({ limit: 100 })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold">Driver Payout Requests</h1>
            <p className="text-sm text-muted-foreground">
              Review and process driver withdrawal requests.
            </p>
          </div>
          <PayoutsTable
            withdrawalRequests={withdrawalRequests}
            paginationMeta={paginationMeta}
          />
        </div>
      </div>
    </AppLayout>
  )
}
