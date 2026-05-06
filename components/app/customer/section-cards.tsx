import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
} from "@tabler/icons-react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CustomerMetrics } from "@/actions/dashboard/getCustomerMetrics"

interface CustomerSectionCardsProps {
  metrics: CustomerMetrics
}

export function CustomerSectionCards({ metrics }: CustomerSectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalCustomerCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Customers <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">All registered customers</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalActiveCustomerForTheMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active This Month <IconUserCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">Logged in within 30 days</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalNewCustomerForTheMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New This Month <IconUserPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">Recently registered accounts</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalInActiveCustomer}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Inactive Customers <IconUserOff className="size-4" />
          </div>
          <div className="text-muted-foreground">No activity in 90+ days</div>
        </CardFooter>
      </Card>
    </div>
  )
}
