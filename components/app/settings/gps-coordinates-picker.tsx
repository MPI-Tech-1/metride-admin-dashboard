"use client"

import { CityCoordinatesMap } from "@/components/app/settings/city-coordinate-picker"
import { joinGps, splitGpsParts } from "@/lib/gps-coordinates"
import {
  PlacesAutocompleteInput,
  type PlaceSelection,
} from "@/components/app/settings/places-autocomplete-input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

/** Map + Places + manual pair, inside existing `APIProvider`. */
export function GpsCoordinatesPicker({
  value,
  onChange,
  mapKey,
  disabled,
  searchInstanceKey,
  showPlacesSearch,
}: {
  value: string
  onChange: (gps: string) => void
  mapKey: string | number
  searchInstanceKey: string | number
  disabled?: boolean
  showPlacesSearch: boolean
}) {
  const { lat, lng } = splitGpsParts(value)

  function applyFromPlace(place: PlaceSelection) {
    onChange(joinGps(place.latitude, place.longitude))
  }

  function applyFromMap(la: number, ln: number) {
    onChange(joinGps(la.toFixed(6), ln.toFixed(6)))
  }

  return (
    <FieldGroup className="gap-4">
      {showPlacesSearch && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Pin on map</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Search or click the map. Coordinates use{" "}
              <span className="font-mono">latitude, longitude</span>.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <FieldLabel
              htmlFor="gps-place-search"
              className="shrink-0 text-xs font-medium text-muted-foreground sm:w-16"
            >
              Search
            </FieldLabel>
            <PlacesAutocompleteInput
              id="gps-place-search"
              instanceKey={searchInstanceKey}
              placeholder="Address or landmark…"
              disabled={disabled}
              onPlaceSelected={applyFromPlace}
              className="h-9 min-w-0 flex-1 bg-background"
            />
          </div>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs font-medium text-muted-foreground">
              Map
            </FieldLabel>
            <CityCoordinatesMap
              mapKey={mapKey}
              latitude={lat}
              longitude={lng}
              disabled={disabled}
              onPick={applyFromMap}
            />
          </Field>
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 min-[360px]:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FieldLabel
            htmlFor="gps-lat"
            className="w-10 shrink-0 text-xs font-medium text-muted-foreground"
            title="Latitude"
          >
            Lat
          </FieldLabel>
          <Input
            id="gps-lat"
            value={lat}
            onChange={(e) => onChange(joinGps(e.target.value, lng))}
            placeholder="11.905750"
            disabled={disabled}
            className="h-9 min-w-0 flex-1 font-mono text-sm tabular-nums"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <FieldLabel
            htmlFor="gps-lng"
            className="w-10 shrink-0 text-xs font-medium text-muted-foreground"
            title="Longitude"
          >
            Lng
          </FieldLabel>
          <Input
            id="gps-lng"
            value={lng}
            onChange={(e) => onChange(joinGps(lat, e.target.value))}
            placeholder="13.091640"
            disabled={disabled}
            className="h-9 min-w-0 flex-1 font-mono text-sm tabular-nums"
          />
        </div>
      </div>
    </FieldGroup>
  )
}
