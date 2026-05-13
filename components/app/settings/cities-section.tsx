"use client"

import { useState, useTransition } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { CityDTO } from "@/actions/settings/listCities"
import createCity from "@/actions/settings/createCity"
import updateCity from "@/actions/settings/updateCity"
import { CityCoordinatesMap } from "@/components/app/settings/city-coordinate-picker"
import {
  PlacesAutocompleteInput,
  type PlaceSelection,
} from "@/components/app/settings/places-autocomplete-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  isGoogleMapsClientReady,
  type GoogleMapsClientConfig,
} from "@/lib/google-maps-client"

function CityFormFields({
  name,
  latitude,
  longitude,
  onNameChange,
  onLatitudeChange,
  onLongitudeChange,
  searchInstanceKey,
  disabled,
  showPlacesSearch,
  mapId,
}: {
  name: string
  latitude: string
  longitude: string
  onNameChange: (v: string) => void
  onLatitudeChange: (v: string) => void
  onLongitudeChange: (v: string) => void
  searchInstanceKey: number | string
  disabled?: boolean
  showPlacesSearch: boolean
  mapId: string
}) {
  function applyCoordinatesFromSearch(place: PlaceSelection) {
    onLatitudeChange(place.latitude)
    onLongitudeChange(place.longitude)
  }

  function applyCoordinatesFromMap(lat: number, lng: number) {
    onLatitudeChange(lat.toFixed(6))
    onLongitudeChange(lng.toFixed(6))
  }

  return (
    <FieldGroup className="gap-5">
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <FieldLabel
          htmlFor="city-name"
          className="shrink-0 text-sm font-medium sm:w-28"
        >
          City name
        </FieldLabel>
        <Input
          id="city-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Lagos"
          disabled={disabled}
          required
          className="h-9 min-w-0 flex-1"
        />
      </div>

      {showPlacesSearch && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4 ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Coordinates</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Search only updates latitude and longitude—not the city name.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <FieldLabel
              htmlFor="city-place-search"
              className="shrink-0 text-xs font-medium text-muted-foreground sm:w-16"
            >
              Search
            </FieldLabel>
            <PlacesAutocompleteInput
              id="city-place-search"
              instanceKey={searchInstanceKey}
              placeholder="Address or landmark…"
              disabled={disabled}
              onPlaceSelected={applyCoordinatesFromSearch}
              className="h-9 min-w-0 flex-1 bg-background"
            />
          </div>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs font-medium text-muted-foreground">
              Map
            </FieldLabel>
            <CityCoordinatesMap
              mapKey={searchInstanceKey}
              latitude={latitude}
              longitude={longitude}
              disabled={disabled}
              onPick={applyCoordinatesFromMap}
              mapId={mapId}
            />
          </Field>
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 min-[360px]:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FieldLabel
            htmlFor="city-lat"
            className="w-10 shrink-0 text-xs font-medium text-muted-foreground"
            title="Latitude"
          >
            Lat
          </FieldLabel>
          <Input
            id="city-lat"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            placeholder="9.076478"
            disabled={disabled}
            required
            className="h-9 min-w-0 flex-1 font-mono text-sm tabular-nums"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <FieldLabel
            htmlFor="city-lng"
            className="w-10 shrink-0 text-xs font-medium text-muted-foreground"
            title="Longitude"
          >
            Lng
          </FieldLabel>
          <Input
            id="city-lng"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            placeholder="7.398574"
            disabled={disabled}
            required
            className="h-9 min-w-0 flex-1 font-mono text-sm tabular-nums"
          />
        </div>
      </div>
    </FieldGroup>
  )
}

function CitiesTableInner({
  cities,
  googleMaps,
}: {
  cities: CityDTO[]
  googleMaps: GoogleMapsClientConfig
}) {
  const mapsReady = isGoogleMapsClientReady(googleMaps)

  const [createOpen, setCreateOpen] = useState(false)
  const [editCity, setEditCity] = useState<CityDTO | null>(null)
  const [searchKey, setSearchKey] = useState(0)
  const [editSearchKey, setEditSearchKey] = useState(0)

  const [name, setName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const [editName, setEditName] = useState("")
  const [editLatitude, setEditLatitude] = useState("")
  const [editLongitude, setEditLongitude] = useState("")

  const [pending, startTransition] = useTransition()

  function openCreate() {
    setName("")
    setLatitude("")
    setLongitude("")
    setSearchKey((k) => k + 1)
    setCreateOpen(true)
  }

  function openEdit(city: CityDTO) {
    setEditCity(city)
    setEditName(city.name)
    setEditLatitude(city.latitude)
    setEditLongitude(city.longitude)
    setEditSearchKey((k) => k + 1)
  }

  function submitCreate() {
    startTransition(async () => {
      const result = await createCity({
        name: name.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
      })
      if (result.success) {
        toast.success(result.message)
        setCreateOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  function submitEdit() {
    if (!editCity) return
    if (
      !editName.trim() ||
      !editLatitude.trim() ||
      !editLongitude.trim()
    ) {
      toast.error("Name and coordinates are required.")
      return
    }
    startTransition(async () => {
      const result = await updateCity({
        identifier: editCity.identifier,
        name: editName.trim(),
        latitude: editLatitude.trim(),
        longitude: editLongitude.trim(),
      })
      if (result.success) {
        toast.success(result.message)
        setEditCity(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Service-area cities and their geographic center points.
        </p>
        <Button type="button" size="sm" className="shrink-0 gap-1.5" onClick={openCreate}>
          <Plus className="size-4" />
          Add city
        </Button>
      </div>

      {!mapsReady && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-50">
          <p className="font-medium">Maps search disabled</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            Set <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">GOOGLE_MAPS_API_KEY</code> and{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">GOOGLE_MAPS_MAP_ID</code> on the server, or{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> and{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">NEXT_PUBLIC_GOOGLE_MAPS_ID</code> before{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">next build</code>. Enable Places API. Coordinates
            can still be entered manually.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">City</TableHead>
              <TableHead className="font-medium">Latitude</TableHead>
              <TableHead className="font-medium">Longitude</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No cities yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city.identifier} className="transition-colors hover:bg-muted/40">
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {city.latitude}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {city.longitude}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(city)}
                      aria-label={`Edit ${city.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-xl">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Add city
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Name the city, then choose coordinates with search or the map.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {mapsReady ? (
              <APIProvider
                apiKey={googleMaps.apiKey}
                libraries={["places", "marker"]}
              >
                <CityFormFields
                  name={name}
                  latitude={latitude}
                  longitude={longitude}
                  onNameChange={setName}
                  onLatitudeChange={setLatitude}
                  onLongitudeChange={setLongitude}
                  searchInstanceKey={searchKey}
                  disabled={pending}
                  showPlacesSearch
                  mapId={googleMaps.mapId}
                />
              </APIProvider>
            ) : (
              <CityFormFields
                name={name}
                latitude={latitude}
                longitude={longitude}
                onNameChange={setName}
                onLatitudeChange={setLatitude}
                onLongitudeChange={setLongitude}
                searchInstanceKey={searchKey}
                disabled={pending}
                showPlacesSearch={false}
                mapId=""
              />
            )}
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitCreate}
              disabled={
                pending ||
                !name.trim() ||
                !latitude.trim() ||
                !longitude.trim()
              }
            >
              {pending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCity} onOpenChange={(open) => !open && setEditCity(null)}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-xl">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit city
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the display name or adjust coordinates any time.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
          {mapsReady ? (
            <APIProvider
              apiKey={googleMaps.apiKey}
              libraries={["places", "marker"]}
            >
              <CityFormFields
                name={editName}
                latitude={editLatitude}
                longitude={editLongitude}
                onNameChange={setEditName}
                onLatitudeChange={setEditLatitude}
                onLongitudeChange={setEditLongitude}
                searchInstanceKey={editSearchKey}
                disabled={pending}
                showPlacesSearch
                mapId={googleMaps.mapId}
              />
            </APIProvider>
          ) : (
            <CityFormFields
              name={editName}
              latitude={editLatitude}
              longitude={editLongitude}
              onNameChange={setEditName}
              onLatitudeChange={setEditLatitude}
              onLongitudeChange={setEditLongitude}
              searchInstanceKey={editSearchKey}
              disabled={pending}
              showPlacesSearch={false}
              mapId=""
            />
          )}
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditCity(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitEdit} disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CitiesSection({
  cities,
  googleMaps,
}: {
  cities: CityDTO[]
  googleMaps: GoogleMapsClientConfig
}) {
  return <CitiesTableInner cities={cities} googleMaps={googleMaps} />
}
