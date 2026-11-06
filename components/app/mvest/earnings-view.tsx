"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import {
  markEarningPaid,
  type MvestEarningDTO,
  type MvestEarningsSummary,
} from "@/actions/mvest/earnings"
import type { MvestOwnerDTO } from "@/actions/mvest/owners"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function formatApiDate(value: string | null): string {
  if (!value) return "—"
  return value.replace(" ", " · ")
}

export function EarningsView({
  earnings,
  summary,
  owners,
  paginationMeta,
  ownerIdentifier,
}: {
  earnings: MvestEarningDTO[]
  summary: MvestEarningsSummary
  owners: MvestOwnerDTO[]
  paginationMeta: PaginationMeta
  ownerIdentifier: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [confirmEarning, setConfirmEarning] = useState<MvestEarningDTO | null>(
    null
  )
  const [pending, startTransition] = useTransition()

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }

  function markPaid() {
    if (!confirmEarning) return
    startTransition(async () => {
      const result = await markEarningPaid(confirmEarning.identifier)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setConfirmEarning(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">MVest earnings</h1>
          <p className="text-sm text-muted-foreground">
            Review owner commissions and record completed payouts. Amounts are
            shown in naira.
          </p>
        </div>
        <Select
          value={ownerIdentifier || "all"}
          onValueChange={(value) =>
            navigate({
              ownerIdentifier: value === "all" ? undefined : value,
              page: "1",
            })
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {owners.map((owner) => (
              <SelectItem key={owner.identifier} value={owner.identifier}>
                {owner.firstName} {owner.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Records" value={String(summary.totalRecords)} />
        <SummaryCard
          label="Eligible amount"
          value={formatNaira(summary.totalEligibleAmount)}
        />
        <SummaryCard
          label="Total commission"
          value={formatNaira(summary.totalCommissionAmount)}
        />
        <SummaryCard
          label="Pending"
          value={formatNaira(summary.pendingAmount)}
        />
        <SummaryCard label="Paid" value={formatNaira(summary.paidAmount)} />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table className="min-w-[1180px]">
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Vehicle & driver</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Eligible amount</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.length ? (
              earnings.map((earning) => (
                <TableRow key={earning.identifier}>
                  <TableCell>
                    <div className="font-medium">
                      {earning.owner.firstName} {earning.owner.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {earning.owner.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {earning.vehicle.plateNumber} · {earning.vehicle.make}{" "}
                      {earning.vehicle.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {earning.driver.firstName} {earning.driver.lastName} ·{" "}
                      {earning.vehicle.rideType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium capitalize">
                      {earning.booking.type} · {earning.booking.status}
                    </div>
                    <div className="max-w-64 truncate text-xs text-muted-foreground">
                      {earning.booking.departureLocationName} →{" "}
                      {earning.booking.destinationLocationName}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {earning.booking.identifier}
                    </div>
                  </TableCell>
                  <TableCell>{formatNaira(earning.eligibleAmount)}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatNaira(earning.commissionAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {earning.commissionPercentage}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        earning.status === "paid" ? "default" : "secondary"
                      }
                      className={
                        earning.status === "paid"
                          ? "bg-emerald-600 text-white"
                          : undefined
                      }
                    >
                      {earning.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatApiDate(earning.paidAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {earning.status !== "paid" ? (
                      <Button
                        size="sm"
                        onClick={() => setConfirmEarning(earning)}
                      >
                        Mark paid
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No earnings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {paginationMeta.total} earning{paginationMeta.total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={paginationMeta.currentPage <= 1}
            onClick={() =>
              navigate({ page: String(paginationMeta.currentPage - 1) })
            }
          >
            Previous
          </Button>
          <span>
            Page {paginationMeta.currentPage} of{" "}
            {Math.max(1, paginationMeta.lastPage)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={paginationMeta.currentPage >= paginationMeta.lastPage}
            onClick={() =>
              navigate({ page: String(paginationMeta.currentPage + 1) })
            }
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={!!confirmEarning}
        onOpenChange={(open) => !open && setConfirmEarning(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payout</DialogTitle>
            <DialogDescription>
              Mark {confirmEarning ? formatNaira(confirmEarning.commissionAmount) : ""}{" "}
              as paid? This records the earning as settled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmEarning(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={markPaid} disabled={pending}>
              {pending ? "Updating…" : "Confirm paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
