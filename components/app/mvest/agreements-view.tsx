"use client"

import { useState, useTransition } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import {
  createAgreement,
  listAvailableVehicles,
  suspendAgreement,
  type AvailableVehicleDTO,
} from "@/actions/mvest/agreements"
import { listOwners, type MvestOwnerDTO } from "@/actions/mvest/owners"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AgreementsView({
  initialOwners,
  initialVehicles,
}: {
  initialOwners: MvestOwnerDTO[]
  initialVehicles: AvailableVehicleDTO[]
}) {
  const [owners, setOwners] = useState(initialOwners)
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [ownerSearch, setOwnerSearch] = useState("")
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [ownerIdentifier, setOwnerIdentifier] = useState("")
  const [vehicleIdentifier, setVehicleIdentifier] = useState("")
  const [commission, setCommission] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endsAt, setEndsAt] = useState("")
  const [createdIdentifier, setCreatedIdentifier] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function searchOwners() {
    startTransition(async () => {
      try {
        const result = await listOwners({
          page: 1,
          limit: 50,
          status: "active",
          search: ownerSearch,
        })
        setOwners(result.owners)
        if (!result.owners.length) toast.info("No active owners found.")
      } catch {
        toast.error("Could not search owners.")
      }
    })
  }

  function searchVehicles() {
    startTransition(async () => {
      try {
        const result = await listAvailableVehicles({
          page: 1,
          limit: 20,
          search: vehicleSearch,
        })
        setVehicles(result)
        if (!result.length) toast.info("No available vehicles found.")
      } catch {
        toast.error("Could not search available vehicles.")
      }
    })
  }

  function submit() {
    const percentage = Number(commission)
    const start = new Date(startsAt)
    const end = hasEndDate ? new Date(endsAt) : null
    if (!ownerIdentifier || !vehicleIdentifier) {
      toast.error("Select an owner and an available vehicle.")
      return
    }
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      toast.error("Commission percentage must be greater than 0 and at most 100.")
      return
    }
    if (
      Number.isNaN(start.getTime()) ||
      (end && (Number.isNaN(end.getTime()) || end <= start))
    ) {
      toast.error("Choose a valid agreement date range.")
      return
    }
    startTransition(async () => {
      const result = await createAgreement({
        ownerIdentifier,
        driverVehicleIdentifier: vehicleIdentifier,
        commissionPercentage: percentage,
        startsAt: start.toISOString(),
        endsAt: end ? end.toISOString() : null,
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setCreatedIdentifier(result.identifier ?? null)
      toast.success(result.message)
    })
  }

  function suspendCreatedAgreement() {
    if (!createdIdentifier) return
    startTransition(async () => {
      const result = await suspendAgreement(createdIdentifier.trim())
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setCreatedIdentifier(null)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">MVest agreements</h1>
        <p className="text-sm text-muted-foreground">
          Link an active owner to an available driver vehicle and define their
          commission.
        </p>
      </div>

      {createdIdentifier ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div>
            <p className="font-medium">Agreement created</p>
            <p className="font-mono text-xs text-muted-foreground">
              {createdIdentifier}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={suspendCreatedAgreement}
            disabled={pending}
          >
            Suspend agreement
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 rounded-xl border p-5 lg:grid-cols-2">
        <section className="space-y-3">
          <FieldLabel>Owner</FieldLabel>
          <div className="flex gap-2">
            <Input
              value={ownerSearch}
              onChange={(event) => setOwnerSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && searchOwners()}
              placeholder="Search active owners, e.g. Ada"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={searchOwners}
              disabled={pending}
              aria-label="Search owners"
            >
              <Search className="size-4" />
            </Button>
          </div>
          <Select
            value={ownerIdentifier}
            onValueChange={setOwnerIdentifier}
            disabled={pending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an active owner" />
            </SelectTrigger>
            <SelectContent>
              {owners.map((owner) => (
                <SelectItem key={owner.identifier} value={owner.identifier}>
                  {owner.firstName} {owner.lastName} — {owner.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-3">
          <FieldLabel>Available vehicle</FieldLabel>
          <div className="flex gap-2">
            <Input
              value={vehicleSearch}
              onChange={(event) => setVehicleSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && searchVehicles()}
              placeholder="Search plate number, e.g. LOCAL-002"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={searchVehicles}
              disabled={pending}
              aria-label="Search vehicles"
            >
              <Search className="size-4" />
            </Button>
          </div>
          <Select
            value={vehicleIdentifier}
            onValueChange={setVehicleIdentifier}
            disabled={pending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an available vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem
                  key={vehicle.driverVehicleIdentifier}
                  value={vehicle.driverVehicleIdentifier}
                >
                  {vehicle.plateNumber} — {vehicle.vehicleMake}{" "}
                  {vehicle.vehicleModel} ({vehicle.driverFirstName}{" "}
                  {vehicle.driverLastName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <Field>
          <FieldLabel htmlFor="agreement-commission">
            Commission percentage
          </FieldLabel>
          <Input
            id="agreement-commission"
            type="number"
            min={0.01}
            max={100}
            step="0.01"
            value={commission}
            onChange={(event) => setCommission(event.target.value)}
            placeholder="10"
            disabled={pending}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="agreement-start">Starts at</FieldLabel>
          <Input
            id="agreement-start"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            disabled={pending}
          />
        </Field>
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="agreement-has-end"
              checked={hasEndDate}
              onCheckedChange={(checked) => setHasEndDate(checked === true)}
              disabled={pending}
            />
            <FieldLabel htmlFor="agreement-has-end">
              This agreement has an end date
            </FieldLabel>
          </div>
          {hasEndDate ? (
            <Field className="max-w-md">
              <FieldLabel htmlFor="agreement-end">Ends at</FieldLabel>
              <Input
                id="agreement-end"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                disabled={pending}
              />
            </Field>
          ) : null}
        </div>
        <div className="flex justify-end lg:col-span-2">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Creating…" : "Create agreement"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="font-semibold">Suspend an agreement</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter an agreement identifier. It is filled automatically after
          creation when the API returns it.
        </p>
        <div className="flex max-w-2xl flex-col gap-2 sm:flex-row">
          <Input
            value={createdIdentifier ?? ""}
            onChange={(event) => setCreatedIdentifier(event.target.value)}
            placeholder="Agreement identifier"
            className="font-mono"
            disabled={pending}
          />
          <Button
            variant="destructive"
            onClick={suspendCreatedAgreement}
            disabled={pending || !createdIdentifier?.trim()}
          >
            Suspend agreement
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A list-agreements response was not included in the API specification,
          so this action uses the agreement identifier directly.
        </p>
      </div>
    </div>
  )
}
