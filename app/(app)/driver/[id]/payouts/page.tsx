export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import DriverLayout from "@/components/layouts/driver-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import getDriver from "@/actions/drivers/getDriver"
import listDriverTransactions from "@/actions/wallet/listDriverTransactions"
import { DriverTransactionsTable } from "@/components/app/wallet/driver-transactions-table"
import { WalletTransactionSectionCards } from "@/components/app/wallet/section-cards"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const [driver, { transactions, paginationMeta }] = await Promise.all([
    getDriver(id),
    listDriverTransactions({
      driverIdentifier: id,
      typeOfTransaction: "debit",
      limit: 100,
    }),
  ])

  const pending = transactions.filter((t) => t.status === "pending").length
  const completed = transactions.filter((t) => t.status === "completed").length
  const failed = transactions.filter((t) => t.status === "failed").length

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Drivers", href: "/driver" },
    { title: "Driver Details", href: `/driver/${id}` },
    { title: "Payouts", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <DriverLayout
        driverId={id}
        activeTab="payouts"
        driver={{
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          mobileNumber: driver.mobileNumber,
          status: driver.status,
          driverDocument: driver.driverDocument,
        }}
      >
        <div className="flex flex-col gap-4 pb-6">
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
      </DriverLayout>
    </AppLayout>
  )
}
