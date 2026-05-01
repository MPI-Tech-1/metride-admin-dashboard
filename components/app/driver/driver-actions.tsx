"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { RejectDriverModal } from "@/components/app/driver/reject-driver-modal"
import approveDriver from "@/actions/drivers/approveDriver"
import { toast } from "sonner"

interface DriverActionsProps {
  driverId: string
  initialStatus: string
}

export default function DriverActions({
  driverId,
  initialStatus,
}: DriverActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveDriver(driverId)

        toast.success("Driver approved successfully")
      } catch (error) {
        console.error(error)
        toast.error("Failed to approve driver")
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          className="p-4"
          onClick={handleApprove}
          disabled={isPending || initialStatus === "approved"}
        >
          {isPending ? "Approving..." : "Approve"}
        </Button>

        <Button
          className="p-4"
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
        >
          Reject
        </Button>
      </div>

      <RejectDriverModal
        driverId={driverId}
        show={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      />
    </>
  )
}
