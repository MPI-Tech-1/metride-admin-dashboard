import {
  IconCalendarCheck,
  IconCalendarClock,
  IconCalendarX,
  IconCalendar,
} from "@tabler/icons-react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookingMetrics } from "@/actions/dashboard/getBookingMetrics"

interface BookingSectionCardsProps {
  metrics: BookingMetrics
}

export function BookingSectionCards({ metrics }: BookingSectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalBookingsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Bookings <IconCalendar className="size-4" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalCompletedBookingsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Completed <IconCalendarCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">Successfully fulfilled rides</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pending <IconCalendarClock className="size-4" />
          </div>
          <div className="text-muted-foreground">Awaiting driver assignment</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalCancelledBookingsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Cancelled <IconCalendarX className="size-4" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>
    </div>
  )
}
