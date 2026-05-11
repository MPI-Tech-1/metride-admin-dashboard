export const dynamic = "force-dynamic"

import { format } from "date-fns"
import { getServerSession } from "next-auth/next"

import listBookings from "@/actions/bookings/listBookings"
import getDashboardOverview from "@/actions/dashboard/getDashboardOverview"
import { authOptions } from "@/lib/auth"
import AppLayout from "@/components/layouts/app-layout"
import { DashboardOverviewPanels } from "@/components/app/dashboard/dashboard-overview"
import { DashboardRecentBookings } from "@/components/app/dashboard/dashboard-recent-bookings"
import { BreadcrumbItem } from "@/types/breadcrumb"

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  return { timeOfDay, name: name.split(" ")[0] }
}

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: "#" }]

  const session = await getServerSession(authOptions)
  const adminName = session?.user?.name ?? "Admin"
  const { timeOfDay, name } = getGreeting(adminName)

  const [overview, { bookings }] = await Promise.all([
    getDashboardOverview(),
    listBookings({ limit: 8 }),
  ])

  const generatedLabel = format(
    new Date(overview.generatedAt),
    "MMM d, yyyy · HH:mm"
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:gap-10 md:py-8 lg:px-6">
          <header className="space-y-1 border-b border-border/60 pb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {timeOfDay}, {name}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Booking, driver, and customer metrics for your network. Figures
              refresh from the live dashboard service.
            </p>
            <p className="text-xs text-muted-foreground">
              Data as of{" "}
              <time dateTime={overview.generatedAt} className="font-medium text-foreground">
                {generatedLabel}
              </time>
              <span className="text-muted-foreground"> (UTC)</span>
            </p>
          </header>

          <DashboardOverviewPanels overview={overview} />

          <DashboardRecentBookings bookings={bookings} />
        </div>
      </div>
    </AppLayout>
  )
}
