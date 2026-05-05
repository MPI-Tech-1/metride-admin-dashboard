export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { DriverTransactionsTable } from "@/components/app/wallet/driver-transactions-table"
import { WalletTransactionSectionCards } from "@/components/app/wallet/section-cards"
import listDriverTransactions from "@/actions/wallet/listDriverTransactions"

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Wallet Transactions", href: "#" },
    { title: "Driver", href: "#" },
  ]

  const { transactions, paginationMeta } = await listDriverTransactions({
    limit: 100,
  })

  const pending = transactions.filter((t) => t.status === "pending").length
  const completed = transactions.filter((t) => t.status === "completed").length
  const failed = transactions.filter((t) => t.status === "failed").length

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold">Driver Wallet Transactions</h1>
            <p className="text-sm text-muted-foreground">
              View all wallet transactions made by drivers on the platform.
            </p>
          </div>
          <WalletTransactionSectionCards
            pending={pending}
            completed={completed}
            failed={failed}
          />
          <DriverTransactionsTable
            transactions={transactions}
            paginationMeta={paginationMeta}
          />
        </div>
      </div>
    </AppLayout>
  )
}
