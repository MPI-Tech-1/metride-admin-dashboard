"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

import type { DriverOnlineRewardDTO } from "@/actions/drivers/listDriverOnlineRewards"
import {
  DriverSelect,
  type SelectedDriver,
} from "@/components/app/drivers/driver-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNaira } from "@/lib/format-currency"
import type PaginationMeta from "@/types/pagination-meta"

const ONLINE_REWARD_PAGE_SIZES = [10, 20, 30, 40, 50]

function formatRewardDate(value: string): string {
  // rewardDate is a calendar date (YYYY-MM-DD); parse as local to avoid TZ drift.
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day)
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date)
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export function OnlineRewardsView({
  rewards,
  paginationMeta,
  date,
  selectedDriver,
}: {
  rewards: DriverOnlineRewardDTO[]
  paginationMeta: PaginationMeta
  date: string
  selectedDriver: SelectedDriver | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  function navigate(page: number, limit = paginationMeta.perPage) {
    pushParams({ page: String(page), limit: String(limit) })
  }

  const hasFilters = Boolean(date || selectedDriver)
  const pageTotal = rewards.reduce((sum, reward) => sum + reward.amount, 0)

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="reward-date" className="text-xs font-medium">
            Reward date
          </label>
          <Input
            id="reward-date"
            type="date"
            value={date}
            onChange={(event) =>
              pushParams({ date: event.target.value || null, page: "1" })
            }
            className="w-44"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="reward-driver" className="text-xs font-medium">
            Driver
          </label>
          <DriverSelect
            id="reward-driver"
            value={selectedDriver}
            onChange={(driver) =>
              pushParams({
                driverIdentifier: driver?.identifier ?? null,
                driverName: driver?.name ?? null,
                page: "1",
              })
            }
          />
        </div>
        {hasFilters ? (
          <Button
            variant="ghost"
            className="gap-1"
            onClick={() =>
              pushParams({
                date: null,
                driverIdentifier: null,
                driverName: null,
                page: "1",
              })
            }
          >
            <X className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table className="min-w-[860px]">
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Reward date</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Time online</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Credited at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  {hasFilters
                    ? "No rewards match these filters."
                    : "No online rewards have been paid yet."}
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.identifier}>
                  <TableCell>
                    <Link
                      href={`/driver/${reward.driver.identifier}`}
                      className="font-medium hover:underline"
                    >
                      {reward.driver.fullName}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {reward.driver.mobileNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reward.driver.email}
                    </div>
                  </TableCell>
                  <TableCell>{formatRewardDate(reward.rewardDate)}</TableCell>
                  <TableCell className="tabular-nums">
                    {reward.windowStartTime} – {reward.windowEndTime}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMinutes(reward.onlineMinutes)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatNaira(reward.amount)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(reward.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {paginationMeta.total} reward{paginationMeta.total === 1 ? "" : "s"}
          {rewards.length > 0 ? ` · ${formatNaira(pageTotal)} on this page` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(paginationMeta.perPage)}
            onValueChange={(value) => navigate(1, Number(value))}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ONLINE_REWARD_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={paginationMeta.currentPage <= paginationMeta.firstPage}
            onClick={() => navigate(paginationMeta.currentPage - 1)}
          >
            Previous
          </Button>
          <span className="min-w-24 text-center">
            Page {paginationMeta.currentPage} of{" "}
            {Math.max(1, paginationMeta.lastPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={paginationMeta.currentPage >= paginationMeta.lastPage}
            onClick={() => navigate(paginationMeta.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
