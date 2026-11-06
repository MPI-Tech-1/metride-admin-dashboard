"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconCar, IconExternalLink, IconSearch, IconUsers } from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import getInitials from "@/lib/get-initials"
import { cn } from "@/lib/utils"

export type ActiveDriverItem = {
  identifier: string
  fullName: string
  lat: number
  lng: number
}

interface ActiveDriversPanelProps {
  drivers: ActiveDriverItem[]
  selectedDriverId: string | null
  onSelectDriver: (driver: ActiveDriverItem) => void
  className?: string
}

function nameToParts(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim()
  if (!trimmed) return { first: "?", last: "?" }
  const parts = trimmed.split(/\s+/)
  const first = parts[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]! : ""
  return { first, last: last || first }
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

export function ActiveDriversPanel({
  drivers,
  selectedDriverId,
  onSelectDriver,
  className,
}: ActiveDriversPanelProps) {
  const [query, setQuery] = useState("")

  const filteredDrivers = useMemo(() => {
    const sorted = [...drivers].sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    )
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return sorted
    return sorted.filter((driver) =>
      driver.fullName.toLowerCase().includes(trimmed)
    )
  }, [drivers, query])

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="border-b border-border/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-tight">Active drivers</p>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            {drivers.length} online
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Drivers reporting their location right now. Refreshes every 30s.
        </p>

        <div className="relative mt-3">
          <IconSearch
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
            aria-label="Search active drivers"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <EmptyState hasQuery={Boolean(query.trim())} />
        ) : (
          <ul className="divide-y divide-border/70">
            {filteredDrivers.map((driver) => {
              const isSelected = selectedDriverId === driver.identifier
              const { first, last } = nameToParts(driver.fullName)

              return (
                <li key={driver.identifier}>
                  <div
                    className={cn(
                      "group flex w-full items-center gap-3 px-4 py-3 transition-colors",
                      "hover:bg-muted/60",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectDriver(driver)}
                      className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none"
                      aria-pressed={isSelected}
                    >
                      <div className="relative shrink-0">
                        <Avatar size="default">
                          <AvatarFallback className="text-[11px] font-semibold">
                            {getInitials(first, last)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-600 ring-2 ring-background"
                          aria-hidden="true"
                        >
                          <IconCar size={8} className="text-white" />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            isSelected
                              ? "text-foreground"
                              : "text-foreground/90"
                          )}
                        >
                          {driver.fullName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          Online
                        </p>
                        <p className="truncate font-mono text-[10px] tabular-nums text-muted-foreground/80">
                          {formatCoords(driver.lat, driver.lng)}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "shrink-0 text-[11px] font-medium transition-colors",
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {isSelected ? "Centered" : "Locate"}
                      </span>
                    </button>

                    <Link
                      href={`/driver/${driver.identifier}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Open ${driver.fullName}'s profile`}
                      title="Open driver profile"
                    >
                      <IconExternalLink size={14} />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <IconUsers size={28} className="text-muted-foreground" stroke={1.5} />
      <p className="text-sm font-medium">
        {hasQuery ? "No matching drivers" : "No active drivers"}
      </p>
      <p className="text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different name."
          : "When drivers come online, they'll appear here."}
      </p>
    </div>
  )
}
