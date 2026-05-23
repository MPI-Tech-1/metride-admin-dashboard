"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps"
import { IconCar, IconRefresh, IconUsers } from "@tabler/icons-react"
import { toast } from "sonner"

import listActiveDrivers, {
  type ActiveDriverDTO,
} from "@/actions/drivers/listActiveDrivers"
import {
  ActiveDriversPanel,
  type ActiveDriverItem,
} from "@/components/app/drivers/active-drivers-panel"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { GoogleMapsClientConfig } from "@/lib/google-maps-client"
import { isGoogleMapsClientReady } from "@/lib/google-maps-client"

const REFRESH_INTERVAL_MS = 30_000
const FOCUS_ZOOM = 16
const DEFAULT_CENTER = { lat: 9.0765, lng: 7.3986 }
const DEFAULT_ZOOM = 6

type FocusTarget = {
  lat: number
  lng: number
  /** Bumps every time we re-focus so identical coords still re-pan. */
  nonce: number
}

function toItem(dto: ActiveDriverDTO): ActiveDriverItem | null {
  const lat = Number(dto.currentLocation?.latitude)
  const lng = Number(dto.currentLocation?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { identifier: dto.identifier, fullName: dto.fullName, lat, lng }
}

function MapController({
  defaultCenter,
  focus,
}: {
  defaultCenter: { lat: number; lng: number }
  focus: FocusTarget | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || focus) return
    map.panTo(defaultCenter)
  }, [map, defaultCenter, focus])

  useEffect(() => {
    if (!map || !focus) return
    map.panTo({ lat: focus.lat, lng: focus.lng })
    map.setZoom(FOCUS_ZOOM)
  }, [map, focus])

  return null
}

interface ActiveDriversViewProps {
  googleMaps: GoogleMapsClientConfig
  initialDrivers: ActiveDriverDTO[]
}

export function ActiveDriversView({
  googleMaps,
  initialDrivers,
}: ActiveDriversViewProps) {
  const [drivers, setDrivers] = useState<ActiveDriverItem[]>(() =>
    initialDrivers.map(toItem).filter((d): d is ActiveDriverItem => d !== null)
  )
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [focus, setFocus] = useState<FocusTarget | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)

  const refresh = useCallback(async ({ silent }: { silent: boolean }) => {
    if (!silent) setIsRefreshing(true)
    try {
      const result = await listActiveDrivers()
      const next = result.drivers
        .map(toItem)
        .filter((d): d is ActiveDriverItem => d !== null)
      setDrivers(next)
    } catch (refreshError) {
      console.error("listActiveDrivers refresh failed", refreshError)
      if (!silent) toast.error("Could not refresh active drivers.")
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }, [])

  // Periodic refresh in the background.
  useEffect(() => {
    const interval = setInterval(() => {
      refresh({ silent: true })
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  // Follow the selected driver as their location updates.
  useEffect(() => {
    if (!selectedDriverId) return
    const next = drivers.find((d) => d.identifier === selectedDriverId)
    if (!next) {
      setSelectedDriverId(null)
      return
    }
    setFocus((prev) => {
      if (prev && prev.lat === next.lat && prev.lng === next.lng) return prev
      return { lat: next.lat, lng: next.lng, nonce: prev ? prev.nonce + 1 : 1 }
    })
  }, [selectedDriverId, drivers])

  const handleSelectDriver = useCallback((driver: ActiveDriverItem) => {
    setSelectedDriverId(driver.identifier)
    setFocus((prev) => ({
      lat: driver.lat,
      lng: driver.lng,
      nonce: prev ? prev.nonce + 1 : 1,
    }))
    setIsMobilePanelOpen(false)
  }, [])

  const handleManualRefresh = useCallback(() => {
    refresh({ silent: false })
  }, [refresh])

  // If we have any drivers, anchor the initial map view to the first one.
  const initialCenter = useMemo(() => {
    if (drivers.length === 0) return DEFAULT_CENTER
    return { lat: drivers[0]!.lat, lng: drivers[0]!.lng }
  }, [drivers])

  const initialZoom = drivers.length > 0 ? 11 : DEFAULT_ZOOM
  const showMapsConfigHint = !isGoogleMapsClientReady(googleMaps)

  return (
    <div className="flex h-full w-full">
      {/* Sidebar — desktop */}
      <div className="hidden h-full w-80 shrink-0 border-r border-border/80 md:block">
        <ActiveDriversPanel
          drivers={drivers}
          selectedDriverId={selectedDriverId}
          onSelectDriver={handleSelectDriver}
        />
      </div>

      {/* Map area */}
      <div className="relative h-full flex-1">
        <APIProvider apiKey={googleMaps.apiKey}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={initialCenter}
            defaultZoom={initialZoom}
            gestureHandling="greedy"
            mapId={googleMaps.mapId}
          >
            <MapController defaultCenter={initialCenter} focus={focus} />

            {drivers.map((driver) => {
              const isSelected = selectedDriverId === driver.identifier
              return (
                <AdvancedMarker
                  key={driver.identifier}
                  position={{ lat: driver.lat, lng: driver.lng }}
                  title={driver.fullName}
                  onClick={() => handleSelectDriver(driver)}
                >
                  <div className="group relative flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border border-white bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300/60 transition-transform ${
                        isSelected ? "scale-110 ring-4 ring-emerald-300" : ""
                      }`}
                    >
                      <IconCar size={14} />
                    </div>
                    <div className="pointer-events-none absolute -top-12 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100">
                      <p>{driver.fullName}</p>
                      <p className="text-[11px] text-background/80">
                        Online · No active trip
                      </p>
                    </div>
                  </div>
                </AdvancedMarker>
              )
            })}
          </Map>
        </APIProvider>

        {showMapsConfigHint && (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 rounded-lg border border-amber-200/90 bg-amber-50/95 px-3 py-2 text-xs text-amber-950 shadow-lg backdrop-blur-sm dark:border-amber-800/80 dark:bg-amber-950/90 dark:text-amber-50">
            <p className="font-medium leading-snug">
              Maps API key or Map ID missing
            </p>
            <p className="mt-1 leading-relaxed opacity-90">
              Set{" "}
              <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
                GOOGLE_MAPS_API_KEY
              </code>{" "}
              +{" "}
              <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
                GOOGLE_MAPS_MAP_ID
              </code>{" "}
              on the server, or{" "}
              <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
                NEXT_PUBLIC_GOOGLE_MAPS_*
              </code>{" "}
              at build time.
            </p>
          </div>
        )}

        {/* Top toolbar */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Sheet open={isMobilePanelOpen} onOpenChange={setIsMobilePanelOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/95 shadow md:hidden"
              >
                <IconUsers size={14} />
                Drivers
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {drivers.length}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Active drivers</SheetTitle>
              </SheetHeader>
              <ActiveDriversPanel
                drivers={drivers}
                selectedDriverId={selectedDriverId}
                onSelectDriver={handleSelectDriver}
              />
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="sm"
            className="bg-background/95 shadow"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <IconRefresh
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {/* Empty state */}
        {drivers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-background/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
              <IconCar
                size={32}
                className="mx-auto mb-2 text-muted-foreground"
              />
              <p className="text-sm font-medium">No active drivers</p>
              <p className="text-xs text-muted-foreground">
                Drivers will appear here when they come online.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
