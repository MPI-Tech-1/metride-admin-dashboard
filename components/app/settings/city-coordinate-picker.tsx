"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps"

const DEFAULT_CENTER = { lat: 9.0765, lng: 7.3986 }

function parseLatLng(
  latStr: string,
  lngStr: string
): google.maps.LatLngLiteral | null {
  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

function MapClickHandler({
  disabled,
  onPick,
}: {
  disabled?: boolean
  onPick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => {
    if (!map || disabled) return
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng
      if (!ll) return
      onPickRef.current(ll.lat(), ll.lng())
    })
    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [map, disabled])

  return null
}

function PanToCoordinates({
  latitude,
  longitude,
}: {
  latitude: string
  longitude: string
}) {
  const map = useMap()
  const parsed = parseLatLng(latitude, longitude)

  useEffect(() => {
    if (!map || !parsed) return
    map.panTo(parsed)
    map.setZoom(14)
  }, [map, parsed?.lat, parsed?.lng])

  return null
}

/** Renders inside `APIProvider` (e.g. with `libraries={["places","marker"]}`). */
export function CityCoordinatesMap({
  latitude,
  longitude,
  onPick,
  disabled,
  mapKey,
  mapId: mapIdProp,
}: {
  latitude: string
  longitude: string
  onPick: (lat: number, lng: number) => void
  disabled?: boolean
  mapKey: string | number
  /** Vector map id for AdvancedMarker; falls back to NEXT_PUBLIC if omitted. */
  mapId?: string
}) {
  const parsed = parseLatLng(latitude, longitude)
  const center = parsed ?? DEFAULT_CENTER
  const mapId =
    mapIdProp ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? ""

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <Map
        key={mapKey}
        style={{ width: "100%", height: "232px" }}
        defaultCenter={center}
        defaultZoom={parsed ? 14 : 6}
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        mapId={mapId}
        clickableIcons={false}
      >
        <MapClickHandler disabled={disabled} onPick={onPick} />
        <PanToCoordinates latitude={latitude} longitude={longitude} />
        {parsed ? (
          <AdvancedMarker position={parsed} title="Selected location">
            <div className="flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20">
              <MapPin className="size-4 shrink-0" strokeWidth={2} />
            </div>
          </AdvancedMarker>
        ) : null}
      </Map>
      {!disabled && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent px-3 pb-2 pt-8">
          <p className="mx-auto max-w-fit rounded-md border border-border/60 bg-background/95 px-2.5 py-1 text-center text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            Click anywhere to set the pin
          </p>
        </div>
      )}
    </div>
  )
}
