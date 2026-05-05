import {
  IconClockHour4,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WalletSectionCardsProps {
  pending: number
  completed: number
  failed: number
}

function StatCard({
  value,
  label,
  sub,
  icon,
  accent,
}: {
  value: number
  label: string
  sub: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-2 text-sm font-medium ${accent}`}>
          {icon}
          {label}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        {sub}
      </CardFooter>
    </Card>
  )
}

export function WalletTransactionSectionCards({
  pending,
  completed,
  failed,
}: WalletSectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-3">
      <StatCard
        value={pending}
        label="Pending Payouts"
        sub="Awaiting approval or rejection"
        icon={<IconClockHour4 className="size-4" />}
        accent="text-yellow-600"
      />
      <StatCard
        value={completed}
        label="Completed Transactions"
        sub="Successfully processed"
        icon={<IconCircleCheck className="size-4" />}
        accent="text-green-600"
      />
      <StatCard
        value={failed}
        label="Failed Transactions"
        sub="Rejected or unsuccessful"
        icon={<IconCircleX className="size-4" />}
        accent="text-red-600"
      />
    </div>
  )
}
