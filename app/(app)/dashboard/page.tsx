export const dynamic = "force-dynamic"

import { format } from "date-fns"
import { getServerSession } from "next-auth/next"

import listBookings, {
  type ListBookingDTO,
} from "@/actions/bookings/listBookings"
import getDashboardOverview, {
  type DashboardOverview,
} from "@/actions/dashboard/getDashboardOverview"
import { authOptions } from "@/lib/auth"
import AppLayout from "@/components/layouts/app-layout"
import { DashboardOverviewPanels } from "@/components/app/dashboard/dashboard-overview"
import { DashboardRecentBookings } from "@/components/app/dashboard/dashboard-recent-bookings"
import { isPathAllowedForRole, normalizeRole } from "@/lib/permissions"
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
  const role = normalizeRole(session?.user?.role)
  const canSeeBookings = role ? isPathAllowedForRole("/booking", role) : false

  // Each fetch is wrapped so a 403 from one doesn't crash the dashboard for
  // roles that legitimately can't see every section.
  const overviewPromise: Promise<DashboardOverview | null> =
    getDashboardOverview().catch((overviewError) => {
      console.error("getDashboardOverview failed", overviewError)
      return null
    })

  const bookingsPromise: Promise<ListBookingDTO[]> = canSeeBookings
    ? listBookings({ limit: 8 })
        .then((result) => result.bookings)
        .catch((bookingsError) => {
          console.error("listBookings failed", bookingsError)
          return []
        })
    : Promise.resolve([])

  const [overview, bookings] = await Promise.all([
    overviewPromise,
    bookingsPromise,
  ])

  const generatedLabel = overview
    ? format(new Date(overview.generatedAt), "MMM d, yyyy · HH:mm")
    : null

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
            {overview && generatedLabel ? (
              <p className="text-xs text-muted-foreground">
                Data as of{" "}
                <time
                  dateTime={overview.generatedAt}
                  className="font-medium text-foreground"
                >
                  {generatedLabel}
                </time>
                <span className="text-muted-foreground"> (UTC)</span>
              </p>
            ) : null}
          </header>

          {overview ? (
            <DashboardOverviewPanels overview={overview} />
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center">
              <p className="text-sm font-medium">Overview unavailable</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We couldn&apos;t load the metrics for this account. Try
                refreshing, or contact an admin if this keeps happening.
              </p>
            </div>
          )}

          {canSeeBookings ? (
            <DashboardRecentBookings bookings={bookings} />
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
