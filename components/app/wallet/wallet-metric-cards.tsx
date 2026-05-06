import {
  IconArrowUp,
  IconArrowDown,
  IconCoinFilled,
  IconCoinOff,
} from "@tabler/icons-react"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletTransactionMetrics } from "@/actions/dashboard/getWalletTransactionMetrics"
import { formatNaira } from "@/lib/format-currency"

interface WalletMetricCardsProps {
  metrics: WalletTransactionMetrics
}

export function WalletMetricCards({ metrics }: WalletMetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalCreditTransactionsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Credit Transactions <IconArrowUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalDebitTransactionsForPastMonth}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Debit Transactions <IconArrowDown className="size-4 text-red-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNaira(metrics.totalCreditAmountForPastMonth)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Credited <IconCoinFilled className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNaira(metrics.totalDebitAmountForPastMonth)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Debited <IconCoinOff className="size-4 text-red-500" />
          </div>
          <div className="text-muted-foreground">Past month</div>
        </CardFooter>
      </Card>
    </div>
  )
}
