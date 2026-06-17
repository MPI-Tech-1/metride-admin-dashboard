"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import cancelBooking from "@/actions/bookings/cancelBooking"
import completeBooking from "@/actions/bookings/completeBooking"
import { AssignDriverModal } from "@/components/app/booking/assign-driver-modal"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BookingDetailActionsProps {
  bookingIdentifier: string
  hasDriver: boolean
  status: string
}

export function BookingDetailActions({
  bookingIdentifier,
  hasDriver,
  status,
}: BookingDetailActionsProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [isCancelling, startCancel] = useTransition()
  const [isCompleting, startComplete] = useTransition()

  const isTerminal = status === "completed" || status === "cancelled"

  function handleCancel() {
    startCancel(async () => {
      const result = await cancelBooking(bookingIdentifier)
      if (result.success) {
        toast.success(result.message)
        setCancelOpen(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleComplete() {
    startComplete(async () => {
      const result = await completeBooking(bookingIdentifier)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  if (isTerminal) return null

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {!hasDriver && (
          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
            Assign Driver
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleComplete}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <span className="flex items-center gap-2">
              <Loader2Icon className="size-3.5 animate-spin" />
              Completing…
            </span>
          ) : (
            "Complete Booking"
          )}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setCancelOpen(true)}
        >
          Cancel Booking
        </Button>
      </div>

      <AssignDriverModal
        bookingIdentifier={bookingIdentifier}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false)
          router.refresh()
        }}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={!isCancelling}>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isCancelling}
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Cancelling…
                </span>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
