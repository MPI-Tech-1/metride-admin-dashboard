import {
  IconTrendingDown,
  IconTrendingUp,
  IconMinus,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardMetric } from "@/actions/dashboard/getDashboardOverview"

function formatTrendPercent(percent: number): string {
  const rounded = Math.round(percent * 10) / 10
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded}%`
}

export function OverviewStatCard({
  label,
  metric,
  icon,
}: {
  label: string
  metric: DashboardMetric
  icon: React.ReactNode
}) {
  const pct = metric.changePercentVsPreviousPeriod
  const hasTrend = pct !== null && pct !== undefined && Number.isFinite(pct)
  const trendUp = hasTrend && pct > 0
  const trendFlat = hasTrend && pct === 0

  return (
    <Card className="border-border/80 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
          {metric.value.toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        {hasTrend ? (
          <Badge
            variant="outline"
            className={cn(
              "gap-0.5 font-normal tabular-nums",
              trendFlat && "text-muted-foreground",
              trendUp && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
              hasTrend && !trendUp && !trendFlat &&
                "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
            )}
          >
            {trendFlat ? (
              <IconMinus className="size-3.5" />
            ) : trendUp ? (
              <IconTrendingUp className="size-3.5" />
            ) : (
              <IconTrendingDown className="size-3.5" />
            )}
            {formatTrendPercent(pct)}
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">Period trend n/a</span>
        )}
      </CardFooter>
    </Card>
  )
}
