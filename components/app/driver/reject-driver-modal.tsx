"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import rejectDriver from "@/actions/drivers/rejectDriver"

type RejectDriverModalProps = {
  driverId: string
  show: boolean
  onClose: () => void
}

export function RejectDriverModal({
  driverId,
  show,
  onClose,
}: RejectDriverModalProps) {
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await rejectDriver({ driverId, reason })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setReason("")
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
          <DialogTitle>Reject Driver</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this driver?
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label className="mb-2" htmlFor="reason">
            Reason
          </Label>
          <Textarea
            id="reason"
            name="reason"
            rows={5}
            placeholder="Why should this driver be rejected?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !reason.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
