import type { DashboardOverview } from "@/actions/dashboard/getDashboardOverview"
import { OverviewStatCard } from "@/components/app/dashboard/overview-stat-card"
import {
  IconCalendarCheck,
  IconCar,
  IconClockCancel,
  IconClockHour4,
  IconRoute,
  IconUserCheck,
  IconUserCog,
  IconUserOff,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react"

function SectionBlock({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-0.5 px-0.5">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </div>
    </section>
  )
}

export function DashboardOverviewPanels({
  overview,
}: {
  overview: DashboardOverview
}) {
  const { bookings, drivers, customers } = overview

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <SectionBlock title="Bookings" note={bookings.comparisonNote}>
        <OverviewStatCard
          label="Total"
          metric={bookings.total}
          icon={<IconCalendarCheck className="size-4" />}
        />
        <OverviewStatCard
          label="Completed"
          metric={bookings.completed}
          icon={<IconCalendarCheck className="size-4" />}
        />
        <OverviewStatCard
          label="Pending assignment"
          metric={bookings.pendingAwaitingDriverAssignment}
          icon={<IconClockHour4 className="size-4" />}
        />
        <OverviewStatCard
          label="In progress"
          metric={bookings.inProgress}
          icon={<IconRoute className="size-4" />}
        />
        <OverviewStatCard
          label="Cancelled"
          metric={bookings.cancelled}
          icon={<IconClockCancel className="size-4" />}
        />
      </SectionBlock>

      <SectionBlock title="Drivers" note={drivers.comparisonNote}>
        <OverviewStatCard
          label="Total"
          metric={drivers.total}
          icon={<IconCar className="size-4" />}
        />
        <OverviewStatCard
          label="Active (24h)"
          metric={drivers.activeLast24Hours}
          icon={<IconUserCheck className="size-4" />}
        />
        <OverviewStatCard
          label="Approved"
          metric={drivers.approved}
          icon={<IconUserCog className="size-4" />}
        />
        <OverviewStatCard
          label="Pending approval"
          metric={drivers.pendingApproval}
          icon={<IconClockHour4 className="size-4" />}
        />
        <OverviewStatCard
          label="Rejected"
          metric={drivers.rejected}
          icon={<IconClockCancel className="size-4" />}
        />
      </SectionBlock>

      <SectionBlock title="Customers" note={customers.comparisonNote}>
        <OverviewStatCard
          label="Total"
          metric={customers.total}
          icon={<IconUsers className="size-4" />}
        />
        <OverviewStatCard
          label="Active (30d)"
          metric={customers.activeLast30Days}
          icon={<IconUserCheck className="size-4" />}
        />
        <OverviewStatCard
          label="New this month"
          metric={customers.newThisCalendarMonth}
          icon={<IconUserPlus className="size-4" />}
        />
        <OverviewStatCard
          label="Inactive (90d+)"
          metric={customers.inactive90PlusDays}
          icon={<IconUserOff className="size-4" />}
        />
      </SectionBlock>
    </div>
  )
}
