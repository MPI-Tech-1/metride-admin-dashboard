export const dynamic = "force-dynamic"

import { Suspense } from "react"

import getDriver from "@/actions/drivers/getDriver"
import listDriverOnlineRewards from "@/actions/drivers/listDriverOnlineRewards"
import type { SelectedDriver } from "@/components/app/drivers/driver-select"
import { OnlineRewardsView } from "@/components/app/drivers/online-rewards-view"
import AppLayout from "@/components/layouts/app-layout"
import type { BreadcrumbItem } from "@/types/breadcrumb"

const PAGE_SIZES = [10, 20, 30, 40, 50]
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    date?: string
    driverIdentifier?: string
    driverName?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const limit = PAGE_SIZES.includes(Number(params.limit))
    ? Number(params.limit)
    : 20
  const date = params.date && DATE_PATTERN.test(params.date) ? params.date : ""
  const driverIdentifier = params.driverIdentifier?.trim() ?? ""

  const { rewards, paginationMeta } = await listDriverOnlineRewards({
    page,
    limit,
    date: date || undefined,
    driverIdentifier: driverIdentifier || undefined,
  })

  const selectedDriver = driverIdentifier
    ? await resolveSelectedDriver(
        driverIdentifier,
        params.driverName?.trim() || rewards[0]?.driver.fullName
      )
    : null

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Drivers", href: "/driver" },
    { title: "Online rewards", href: "/drivers/online-rewards" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold">Online rewards</h1>
            <p className="text-sm text-muted-foreground">
              Rewards paid to drivers for staying online through the reward
              window.
            </p>
          </div>
          <Suspense>
            <OnlineRewardsView
              rewards={rewards}
              paginationMeta={paginationMeta}
              date={date}
              selectedDriver={selectedDriver}
            />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}

/**
 * The URL only guarantees the driver's UUID; resolve a display name for the
 * picker, falling back to fetching the driver when no name is at hand.
 */
async function resolveSelectedDriver(
  identifier: string,
  knownName: string | undefined
): Promise<SelectedDriver> {
  if (knownName) return { identifier, name: knownName }
  try {
    const driver = await getDriver(identifier)
    return {
      identifier,
      name: `${driver.firstName} ${driver.lastName}`.trim(),
    }
  } catch {
    return { identifier, name: "Selected driver" }
  }
}
