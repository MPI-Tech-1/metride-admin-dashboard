export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import listBookings from "@/actions/bookings/listBookings"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCalendarCheck,
  IconClockCancel,
  IconCar,
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconUserCog,
  IconClockHour4,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  return { timeOfDay, name: name.split(" ")[0] }
}

function StatCard({
  value,
  trend,
  trendUp,
  label,
  sub,
  icon,
}: {
  value: string
  trend: string
  trendUp: boolean
  label: string
  sub: string
  icon: React.ReactNode
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {trendUp ? <IconTrendingUp /> : <IconTrendingDown />}
            {trend}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {label} {icon}
        </div>
        <div className="text-muted-foreground">{sub}</div>
      </CardFooter>
    </Card>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    created: "bg-muted text-muted-foreground border-border",
    "assigned-a-driver": "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  }
  return (
    <Badge variant="outline" className={`capitalize ${map[status] ?? ""}`}>
      {status.replace(/-/g, " ")}
    </Badge>
  )
}

export default async function Page() {
  const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: "#" }]

  const session = await getServerSession(authOptions)
  const adminName = session?.user?.name ?? "Admin"
  const { timeOfDay, name } = getGreeting(adminName)

  const { bookings } = await listBookings({ limit: 8 })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
          {/* Greeting */}
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {timeOfDay}, {name} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s an overview of the platform today.
            </p>
          </div>

          {/* Stat cards */}
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            {/* Row 1 — Bookings */}
            <SectionLabel>Bookings</SectionLabel>
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
              <StatCard value="0" trend="+0%" trendUp label="Total Bookings" sub="Compared to last month" icon={<IconCalendarCheck className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="Completed Bookings" sub="Successfully fulfilled" icon={<IconCalendarCheck className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="Pending Bookings" sub="Awaiting driver assignment" icon={<IconClockHour4 className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp={false} label="Cancelled Bookings" sub="Compared to last month" icon={<IconClockCancel className="size-4" />} />
            </div>

            {/* Row 2 — Drivers */}
            <SectionLabel>Drivers</SectionLabel>
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
              <StatCard value="0" trend="+0%" trendUp label="Total Drivers" sub="Compared to last month" icon={<IconCar className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="Active Drivers" sub="Online in last 24 hours" icon={<IconUserCheck className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="Approved Drivers" sub="Cleared for rides" icon={<IconUserCog className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp={false} label="Pending Approval" sub="Awaiting review" icon={<IconClockHour4 className="size-4" />} />
            </div>

            {/* Row 3 — Customers */}
            <SectionLabel>Customers</SectionLabel>
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
              <StatCard value="0" trend="+0%" trendUp label="Total Customers" sub="Compared to last month" icon={<IconUsers className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="Active Customers" sub="Logged in within 30 days" icon={<IconUserCheck className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp label="New This Month" sub="Recently registered" icon={<IconUserPlus className="size-4" />} />
              <StatCard value="0" trend="+0%" trendUp={false} label="Inactive Customers" sub="No activity in 90+ days" icon={<IconUserOff className="size-4" />} />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="flex flex-col gap-3 px-4 lg:px-6">
            <div>
              <h2 className="text-base font-semibold">Recent Bookings</h2>
              <p className="text-xs text-muted-foreground">
                The latest bookings placed on the platform.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right">Booked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No bookings yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.identifier}>
                        <TableCell>
                          <p className="font-medium">
                            {booking.customer.firstName} {booking.customer.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.customer.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={booking.typeOfBooking === "shuttle" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {booking.typeOfBooking}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="line-clamp-1 max-w-[180px] text-xs">
                            {booking.departureLocation.name}
                          </p>
                          <p className="line-clamp-1 max-w-[180px] text-xs text-muted-foreground">
                            → {booking.destinationLocation.name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell>
                          {booking.assignedDriver ? (
                            <span className="text-sm">
                              {booking.assignedDriver.firstName}{" "}
                              {booking.assignedDriver.lastName}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(booking.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
