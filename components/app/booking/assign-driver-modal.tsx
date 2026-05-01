"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Loader2Icon, SearchIcon, UserIcon, CheckIcon } from "lucide-react"
import listDrivers, { ListDriverDTO } from "@/actions/drivers/listDrivers"
import assignDriver from "@/actions/bookings/assignDriver"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type AssignDriverModalProps = {
  bookingIdentifier: string
  open: boolean
  onClose: () => void
}

const DEBOUNCE_MS = 400

export function AssignDriverModal({
  bookingIdentifier,
  open,
  onClose,
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<ListDriverDTO[]>([])
  const [isFetching, startFetch] = useTransition()
  const [isAssigning, startAssign] = useTransition()
  const [search, setSearch] = useState("")
  const [selectedDriver, setSelectedDriver] = useState<ListDriverDTO | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function fetchDrivers(query: string) {
    startFetch(async () => {
      const { drivers: fetched } = await listDrivers({
        limit: 50,
        ...(query.trim() ? { searchQuery: query.trim() } : {}),
      })
      setDrivers(fetched.filter((d) => d.status === "approved"))
    })
  }

  // Initial load when modal opens
  useEffect(() => {
    if (!open) return
    setSearch("")
    setSelectedDriver(null)
    setDrivers([])
    fetchDrivers("")
  }, [open])

  // Debounced search
  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchDrivers(value)
    }, DEBOUNCE_MS)
  }

  function handleAssign() {
    if (!selectedDriver) return
    startAssign(async () => {
      const result = await assignDriver({
        bookingIdentifier,
        driverIdentifier: selectedDriver.identifier,
      })
      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  const isPending = isFetching || isAssigning

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Assign a driver</DialogTitle>
          <DialogDescription>
            Search and select an approved driver to assign to this booking.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          {isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            placeholder="Search by name, email or phone…"
            className="pl-8"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isAssigning}
            autoFocus
          />
        </div>

        {/* Driver list */}
        <div className="max-h-72 overflow-y-auto rounded-lg border">
          {isFetching && drivers.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading drivers…
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {search.trim()
                ? "No drivers match your search."
                : "No approved drivers found."}
            </div>
          ) : (
            <ul className="divide-y">
              {drivers.map((driver) => {
                const isSelected =
                  selectedDriver?.identifier === driver.identifier
                return (
                  <li key={driver.identifier}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDriver(isSelected ? null : driver)
                      }
                      disabled={isAssigning}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 disabled:pointer-events-none ${
                        isSelected ? "bg-muted" : ""
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <UserIcon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {driver.firstName} {driver.lastName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {driver.email} · {driver.mobileNumber}
                        </span>
                      </span>
                      {isSelected && (
                        <CheckIcon className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Selected driver chip */}
        {selectedDriver && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Selected:</span>
            <Badge variant="secondary">
              {selectedDriver.firstName} {selectedDriver.lastName}
            </Badge>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedDriver || isPending}
          >
            {isAssigning ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-3.5 animate-spin" />
                Assigning…
              </span>
            ) : (
              "Assign driver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
