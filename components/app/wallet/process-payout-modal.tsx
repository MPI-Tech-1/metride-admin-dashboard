"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Loader2Icon, CircleCheckIcon, CircleXIcon } from "lucide-react"
import approveDriverPayout from "@/actions/wallet/approveDriverPayout"
import rejectDriverPayout from "@/actions/wallet/rejectDriverPayout"
import { DriverWalletTransactionDTO } from "@/actions/wallet/listDriverTransactions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

interface ProcessPayoutModalProps {
  transaction: DriverWalletTransactionDTO
  open: boolean
  onClose: () => void
}

export function ProcessPayoutModal({
  transaction,
  open,
  onClose,
}: ProcessPayoutModalProps) {
  const [isApproving, startApprove] = useTransition()
  const [isRejecting, startReject] = useTransition()

  const isPending = isApproving || isRejecting

  function handleApprove() {
    startApprove(async () => {
      const result = await approveDriverPayout(transaction.identifier)
      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleReject() {
    startReject(async () => {
      const result = await rejectDriverPayout(transaction.identifier)
      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Process Payout Request</DialogTitle>
          <DialogDescription>
            Review the payout details below and choose to approve or reject.
          </DialogDescription>
        </DialogHeader>

        {/* Payout details */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Driver</span>
            <span className="font-medium">{transaction.driver.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-lg font-bold text-red-600">
              -{formatAmount(transaction.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Remark</span>
            <span className="max-w-[200px] text-right">{transaction.remark}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs text-muted-foreground">
              {transaction.systemGeneratedTransactionReference.slice(0, 16)}…
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant="outline"
              className="border-yellow-200 bg-yellow-100 capitalize text-yellow-700"
            >
              pending
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isApproving ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" />
                Approving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CircleCheckIcon className="size-4" />
                Approve Payout
              </span>
            )}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleReject}
            disabled={isPending}
          >
            {isRejecting ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" />
                Rejecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CircleXIcon className="size-4" />
                Reject Payout
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
