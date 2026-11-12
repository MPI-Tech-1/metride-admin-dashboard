export const dynamic = "force-dynamic"

import Link from "next/link"

import getDriverOnlineRewardSettings from "@/actions/settings/getDriverOnlineRewardSettings"
import { DriverOnlineRewardSettingsForm } from "@/components/app/settings/driver-online-reward-settings-form"
import AppLayout from "@/components/layouts/app-layout"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const settings = await getDriverOnlineRewardSettings()

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Online reward", href: "/settings/driver-online-reward" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Driver online reward</h1>
            <p className="text-sm text-muted-foreground">
              Reward drivers for staying online during a daily time window.
              Amounts are stored in kobo and shown in naira.{" "}
              <Link
                href="/drivers/online-rewards"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                View paid rewards
              </Link>
            </p>
          </div>
          <DriverOnlineRewardSettingsForm
            key={settings.updatedAt}
            settings={settings}
          />
        </div>
      </div>
    </AppLayout>
  )
}
