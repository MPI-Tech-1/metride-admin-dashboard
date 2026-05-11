"use client"

import { useMemo, useState, useTransition } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { CityDTO } from "@/actions/settings/listCities"
import type { PopularLocationDTO } from "@/actions/settings/listPopularLocations"
import createPopularLocation from "@/actions/settings/createPopularLocation"
import updatePopularLocation from "@/actions/settings/updatePopularLocation"
import { GpsCoordinatesPicker } from "@/components/app/settings/gps-coordinates-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  canonicalGpsString,
  isValidGpsPair,
} from "@/lib/gps-coordinates"

const LOCATION_TYPES = [
  "residential_area",
  "hospital",
  "recreation",
  "landmark",
  "business",
  "school",
  "market",
  "airport",
] as const

function typeSelectOptions(current: string): string[] {
  const set = new Set<string>([...LOCATION_TYPES])
  if (current && !set.has(current)) {
    return [...LOCATION_TYPES, current]
  }
  return [...LOCATION_TYPES]
}

function formatLocationType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function PopularLocationFormFields({
  cities,
  cityIdentifier,
  onCityChange,
  name,
  onNameChange,
  gpsCoordinates,
  onGpsChange,
  typeOfLocation,
  onTypeChange,
  isActive,
  onIsActiveChange,
  mapsReady,
  mapKey,
  searchKey,
  disabled,
}: {
  cities: CityDTO[]
  cityIdentifier: string
  onCityChange: (id: string) => void
  name: string
  onNameChange: (v: string) => void
  gpsCoordinates: string
  onGpsChange: (v: string) => void
  typeOfLocation: string
  onTypeChange: (v: string) => void
  isActive: boolean
  onIsActiveChange: (v: boolean) => void
  mapsReady: boolean
  mapKey: string | number
  searchKey: string | number
  disabled?: boolean
}) {
  return (
    <FieldGroup className="gap-4">
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 min-[400px]:gap-4">
        <Field>
          <FieldLabel className="text-sm font-medium">City</FieldLabel>
          <Select
            value={cityIdentifier}
            onValueChange={onCityChange}
            disabled={disabled || cities.length === 0}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.identifier} value={c.identifier}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel className="text-sm font-medium">Location type</FieldLabel>
          <Select
            value={typeOfLocation}
            onValueChange={onTypeChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {typeSelectOptions(typeOfLocation).map((t) => (
                <SelectItem key={t} value={t}>
                  {formatLocationType(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 items-center gap-3 min-[480px]:grid-cols-[1fr_auto] min-[480px]:items-end">
        <Field>
          <FieldLabel htmlFor="pop-loc-name" className="text-sm font-medium">
            Location name
          </FieldLabel>
          <Input
            id="pop-loc-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Monday Market"
            disabled={disabled}
            className="h-9"
          />
        </Field>

        <div className="flex min-h-9 items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 min-[480px]:border-0 min-[480px]:bg-transparent min-[480px]:px-0 min-[480px]:py-0">
          <Checkbox
            id="pop-loc-active"
            checked={isActive}
            onCheckedChange={(c) => onIsActiveChange(c === true)}
            disabled={disabled}
          />
          <FieldLabel
            htmlFor="pop-loc-active"
            title="Shown to customers during booking"
            className="cursor-pointer text-sm font-normal leading-snug"
          >
            Active
          </FieldLabel>
        </div>
      </div>

      {mapsReady ? (
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
          libraries={["places", "marker"]}
        >
          <GpsCoordinatesPicker
            value={gpsCoordinates}
            onChange={onGpsChange}
            mapKey={mapKey}
            searchInstanceKey={searchKey}
            disabled={disabled}
            showPlacesSearch
          />
        </APIProvider>
      ) : (
        <GpsCoordinatesPicker
          value={gpsCoordinates}
          onChange={onGpsChange}
          mapKey={mapKey}
          searchInstanceKey={searchKey}
          disabled={disabled}
          showPlacesSearch={false}
        />
      )}
    </FieldGroup>
  )
}

export function PopularLocationsSection({
  locations,
  cities,
}: {
  locations: PopularLocationDTO[]
  cities: CityDTO[]
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
  const mapsReady = Boolean(apiKey)

  const [createOpen, setCreateOpen] = useState(false)
  const [editLoc, setEditLoc] = useState<PopularLocationDTO | null>(null)
  const [createKey, setCreateKey] = useState(0)
  const [editKey, setEditKey] = useState(0)

  const [cityIdentifier, setCityIdentifier] = useState("")
  const [name, setName] = useState("")
  const [gpsCoordinates, setGpsCoordinates] = useState("")
  const [typeOfLocation, setTypeOfLocation] = useState<string>(
    LOCATION_TYPES[0]
  )
  const [isActive, setIsActive] = useState(true)

  const [editCityIdentifier, setEditCityIdentifier] = useState("")
  const [editName, setEditName] = useState("")
  const [editGps, setEditGps] = useState("")
  const [editType, setEditType] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  const [pending, startTransition] = useTransition()

  function openCreate() {
    setCityIdentifier(cities[0]?.identifier ?? "")
    setName("")
    setGpsCoordinates("")
    setTypeOfLocation(LOCATION_TYPES[0])
    setIsActive(true)
    setCreateKey((k) => k + 1)
    setCreateOpen(true)
  }

  function openEdit(loc: PopularLocationDTO) {
    setEditLoc(loc)
    setEditCityIdentifier(loc.city.identifier)
    setEditName(loc.name.trim())
    setEditGps(canonicalGpsString(loc.gpsCoordinates))
    setEditType(loc.typeOfLocation.trim())
    setEditIsActive(loc.isActive)
    setEditKey((k) => k + 1)
  }

  function submitCreate() {
    if (!cityIdentifier || !name.trim() || !isValidGpsPair(gpsCoordinates)) {
      toast.error("Select a city, enter a name, and valid GPS coordinates.")
      return
    }
    startTransition(async () => {
      const result = await createPopularLocation({
        cityIdentifier,
        name: name.trim(),
        gpsCoordinates: gpsCoordinates.trim(),
        typeOfLocation,
        isActive,
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
    if (!editLoc) return
    if (!editCityIdentifier || !editName.trim() || !isValidGpsPair(editGps)) {
      toast.error("Select a city, enter a name, and valid GPS coordinates.")
      return
    }
    startTransition(async () => {
      const result = await updatePopularLocation({
        identifier: editLoc.identifier,
        cityIdentifier: editCityIdentifier,
        name: editName.trim(),
        gpsCoordinates: editGps.trim(),
        typeOfLocation: editType,
        isActive: editIsActive,
      })
      if (result.success) {
        toast.success(result.message)
        setEditLoc(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  const citiesForEditDialog = useMemo(() => {
    if (!editLoc) return cities
    if (cities.some((c) => c.identifier === editLoc.city.identifier)) {
      return cities
    }
    return [
      {
        identifier: editLoc.city.identifier,
        name: editLoc.city.name,
        latitude: editLoc.city.latitude,
        longitude: editLoc.city.longitude,
      },
      ...cities,
    ]
  }, [cities, editLoc])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Frequent pickup and drop-off spots shown during booking.
        </p>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={openCreate}
          disabled={cities.length === 0}
        >
          <Plus className="size-4" />
          Add location
        </Button>
      </div>

      {cities.length === 0 && (
        <p className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Add at least one city under Settings → Cities before creating popular
          locations.
        </p>
      )}

      {!mapsReady && cities.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-50">
          <p className="font-medium">Maps search disabled</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            Set <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
            and <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/50">NEXT_PUBLIC_GOOGLE_MAPS_ID</code> for
            map pick. You can still type coordinates manually.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium">City</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="hidden font-medium md:table-cell">
                GPS
              </TableHead>
              <TableHead className="w-[88px] font-medium">Status</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No popular locations yet.
                </TableCell>
              </TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow
                  key={loc.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {loc.city.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {formatLocationType(loc.typeOfLocation)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                    {loc.gpsCoordinates}
                  </TableCell>
                  <TableCell>
                    {loc.isActive ? (
                      <Badge className="border-green-200 bg-green-100 font-normal text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(loc)}
                      aria-label={`Edit ${loc.name}`}
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
              Add popular location
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Tie the place to a city and set GPS as{" "}
              <span className="font-mono">latitude, longitude</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <PopularLocationFormFields
              cities={cities}
              cityIdentifier={cityIdentifier}
              onCityChange={setCityIdentifier}
              name={name}
              onNameChange={setName}
              gpsCoordinates={gpsCoordinates}
              onGpsChange={setGpsCoordinates}
              typeOfLocation={typeOfLocation}
              onTypeChange={setTypeOfLocation}
              isActive={isActive}
              onIsActiveChange={setIsActive}
              mapsReady={mapsReady}
              mapKey={`create-${createKey}`}
              searchKey={createKey}
              disabled={pending}
            />
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
            <Button type="button" onClick={submitCreate} disabled={pending}>
              {pending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLoc} onOpenChange={(open) => !open && setEditLoc(null)}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-xl">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit popular location
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update city, name, coordinates, type, or visibility.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <PopularLocationFormFields
              cities={citiesForEditDialog}
              cityIdentifier={editCityIdentifier}
              onCityChange={setEditCityIdentifier}
              name={editName}
              onNameChange={setEditName}
              gpsCoordinates={editGps}
              onGpsChange={setEditGps}
              typeOfLocation={editType}
              onTypeChange={setEditType}
              isActive={editIsActive}
              onIsActiveChange={setEditIsActive}
              mapsReady={mapsReady}
              mapKey={`edit-${editKey}`}
              searchKey={editKey}
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditLoc(null)}
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
