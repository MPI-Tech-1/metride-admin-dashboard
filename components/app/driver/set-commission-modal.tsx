"use client"

import { useEffect, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import updateDriverCommission from "@/actions/drivers/updateDriverCommission"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SetCommissionModalProps = {
  driverId: string
  show: boolean
  onClose: () => void
  currentCommissionPercentage?: number | null
}

export function SetCommissionModal({
  driverId,
  show,
  onClose,
  currentCommissionPercentage,
}: SetCommissionModalProps) {
  const initial =
    currentCommissionPercentage !== null &&
    currentCommissionPercentage !== undefined
      ? String(currentCommissionPercentage)
      : ""

  const [value, setValue] = useState(initial)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (show) setValue(initial)
    // Only re-sync the input when the modal opens or the driver's current
    // commission changes from outside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, currentCommissionPercentage])

  const numeric = Number(value)
  const isValid =
    value.trim() !== "" &&
    Number.isFinite(numeric) &&
    numeric >= 0 &&
    numeric <= 100

  function handleSubmit() {
    if (!isValid) {
      toast.error("Commission must be a number between 0 and 100.")
      return
    }

    startTransition(async () => {
      const result = await updateDriverCommission({
        driverId,
        commissionPercentage: numeric,
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      onClose()
    })
  }

  return (
    <Dialog
      open={show}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set driver commission</DialogTitle>
          <DialogDescription>
            Percentage of each trip the driver receives. Enter a value between
            0 and 100.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="commissionPercentage">Commission percentage</Label>
          <div className="relative">
            <Input
              id="commissionPercentage"
              name="commissionPercentage"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              placeholder="e.g. 60"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isPending}
              className="h-10 pr-9 tabular-nums"
              autoFocus
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending || !isValid}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save commission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
