"use client"

import { useState } from "react"
import { IconPercentage, IconPencil } from "@tabler/icons-react"

import { SetCommissionModal } from "@/components/app/driver/set-commission-modal"
import { Button } from "@/components/ui/button"

interface DriverSettingsCardProps {
  driverId: string
  /** Raw commission percentage from the API ("70.00") or null. */
  commissionPercentage: string | null
}

function formatCommission(raw: string | null): {
  display: string
  numeric: number | null
} {
  if (raw === null || raw === undefined || raw === "") {
    return { display: "—", numeric: null }
  }
  const numeric = Number(raw)
  if (!Number.isFinite(numeric)) {
    return { display: raw, numeric: null }
  }
  // Trim trailing zeros while keeping a sensible precision (e.g. 70.00 -> 70).
  const display = Number.isInteger(numeric)
    ? `${numeric}`
    : numeric.toFixed(2).replace(/\.?0+$/, "")
  return { display, numeric }
}

export function DriverSettingsCard({
  driverId,
  commissionPercentage,
}: DriverSettingsCardProps) {
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false)

  const { display, numeric } = formatCommission(commissionPercentage)

  return (
    <>
      <section
        className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-5 shadow-sm sm:p-6"
        aria-labelledby="driver-settings-heading"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <IconPercentage size={22} stroke={1.75} />
            </div>

            <div className="min-w-0">
              <p
                id="driver-settings-heading"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Driver commission
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">
                  {display}
                </span>
                {numeric !== null && (
                  <span className="text-lg font-semibold text-muted-foreground sm:text-xl">
                    %
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Share of each completed trip the driver receives. Update any
                time.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setIsCommissionModalOpen(true)}
          >
            <IconPencil size={14} />
            {numeric !== null ? "Edit commission" : "Set commission"}
          </Button>
        </div>
      </section>

      <SetCommissionModal
        driverId={driverId}
        show={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        currentCommissionPercentage={numeric}
      />
    </>
  )
}
