"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import listDrivers, { type ListDriverDTO } from "@/actions/drivers/listDrivers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface SelectedDriver {
  identifier: string
  name: string
}

const DEBOUNCE_MS = 350

/**
 * Searchable driver picker. Fetches drivers from the API as the admin types
 * and reports the chosen driver's identifier (UUID) via `onChange`.
 */
export function DriverSelect({
  value,
  onChange,
  placeholder = "All drivers",
  id,
  className,
}: {
  value: SelectedDriver | null
  onChange: (driver: SelectedDriver | null) => void
  placeholder?: string
  id?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [drivers, setDrivers] = useState<ListDriverDTO[]>([])
  const [failed, setFailed] = useState(false)
  const [isFetching, startFetch] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestRef = useRef(0)

  function fetchDrivers(query: string) {
    const requestId = ++requestRef.current
    startFetch(async () => {
      try {
        const { drivers: fetched } = await listDrivers({
          limit: 20,
          ...(query.trim() ? { searchQuery: query.trim() } : {}),
        })
        // Ignore responses that arrive after a newer search was started.
        if (requestId !== requestRef.current) return
        setDrivers(fetched)
        setFailed(false)
      } catch {
        if (requestId !== requestRef.current) return
        setDrivers([])
        setFailed(true)
      }
    })
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (next) {
      setSearch("")
      fetchDrivers("")
    }
  }

  function handleSearchChange(next: string) {
    setSearch(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchDrivers(next), DEBOUNCE_MS)
  }

  function select(driver: SelectedDriver | null) {
    onChange(driver)
    setOpen(false)
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-72 justify-between font-normal"
          >
            <span
              className={cn("truncate", !value && "text-muted-foreground")}
            >
              {value ? value.name : placeholder}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <div className="relative border-b p-2">
            {isFetching ? (
              <Loader2Icon className="absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <SearchIcon className="absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name, email or phone…"
              className="h-8 pl-8"
              autoFocus
            />
          </div>

          <ul className="max-h-72 overflow-y-auto p-1" role="listbox">
            <li>
              <button
                type="button"
                onClick={() => select(null)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <CheckIcon
                  className={cn("size-4", value ? "opacity-0" : "opacity-100")}
                />
                All drivers
              </button>
            </li>

            {isFetching && drivers.length === 0 ? (
              <li className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Loading drivers…
              </li>
            ) : failed ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Could not load drivers.
              </li>
            ) : drivers.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                {search.trim() ? "No drivers match your search." : "No drivers found."}
              </li>
            ) : (
              drivers.map((driver) => {
                const name = `${driver.firstName} ${driver.lastName}`.trim()
                const isSelected = value?.identifier === driver.identifier
                return (
                  <li key={driver.identifier}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() =>
                        select({ identifier: driver.identifier, name })
                      }
                      className="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-muted"
                    >
                      <CheckIcon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {driver.mobileNumber} · {driver.email}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          aria-label="Clear driver filter"
        >
          <XIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}
