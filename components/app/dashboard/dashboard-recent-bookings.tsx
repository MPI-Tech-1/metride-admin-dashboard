import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

import type { ListBookingDTO } from "@/actions/bookings/listBookings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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

export function DashboardRecentBookings({
  bookings,
}: {
  bookings: ListBookingDTO[]
}) {
  return (
    <Card className="border-border/80 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
      <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Recent bookings
          </CardTitle>
          <CardDescription className="text-sm">
            Latest activity on the platform.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/booking">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="hidden font-medium md:table-cell">
                  Route
                </TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="hidden font-medium lg:table-cell">
                  Driver
                </TableHead>
                <TableHead className="text-right font-medium">Booked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.identifier}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <p className="font-medium leading-tight">
                        {booking.customer.firstName} {booking.customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.typeOfBooking === "shuttle"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {booking.typeOfBooking}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] md:table-cell">
                      <p className="line-clamp-1 text-xs">
                        {booking.departureLocation.name}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        → {booking.destinationLocation.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
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
                    <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
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
      </CardContent>
    </Card>
  )
}
