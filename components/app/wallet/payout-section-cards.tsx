import {
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCoin,
} from "@tabler/icons-react"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PayoutMetrics } from "@/actions/dashboard/getPayoutMetrics"
import { formatNaira } from "@/lib/format-currency"

interface PayoutSectionCardsProps {
  metrics: PayoutMetrics
}

export function PayoutSectionCards({ metrics }: PayoutSectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalPendingPayouts}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pending <IconClock className="size-4 text-yellow-500" />
          </div>
          <div className="text-muted-foreground">Awaiting approval</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalApprovedPayoutsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Approved <IconCircleCheck className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalRejectedPayoutsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rejected <IconCircleX className="size-4 text-red-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNaira(metrics.totalApprovedPayoutAmountForPastMonth)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Amount Paid Out <IconCoin className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>
    </div>
  )
}
