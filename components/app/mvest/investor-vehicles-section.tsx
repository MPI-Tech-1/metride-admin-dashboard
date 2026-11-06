"use client"

import { useMemo, useState, useTransition } from "react"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { InvestorDTO } from "@/actions/mvest/listInvestors"
import type { InvestorVehicleDTO } from "@/actions/mvest/listInvestorVehicles"
import createInvestorVehicle from "@/actions/mvest/createInvestorVehicle"
import updateInvestorVehicle from "@/actions/mvest/updateInvestorVehicle"
import type { RideTypeDTO } from "@/actions/settings/listRideTypes"
import type { VehicleMakeDTO } from "@/actions/settings/listVehicleMakes"
import type { VehicleModelDTO } from "@/actions/settings/listVehicleModels"
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

interface VehicleFormState {
  investorIdentifier: string
  rideTypeIdentifier: string
  vehicleMakeIdentifier: string
  vehicleModelIdentifier: string
  colorOfVehicle: string
  plateNumber: string
  seatCapacity: string
  percentageShare: string
}

function emptyForm(
  investors: InvestorDTO[],
  rideTypes: RideTypeDTO[],
  makes: VehicleMakeDTO[]
): VehicleFormState {
  return {
    investorIdentifier: investors[0]?.identifier ?? "",
    rideTypeIdentifier: rideTypes[0]?.identifier ?? "",
    vehicleMakeIdentifier: makes[0]?.identifier ?? "",
    vehicleModelIdentifier: "",
    colorOfVehicle: "",
    plateNumber: "",
    seatCapacity: "",
    percentageShare: "",
  }
}

function isFormValid(form: VehicleFormState) {
  return (
    form.investorIdentifier &&
    form.rideTypeIdentifier &&
    form.vehicleMakeIdentifier &&
    form.vehicleModelIdentifier &&
    form.colorOfVehicle.trim() &&
    form.plateNumber.trim() &&
    form.seatCapacity.trim() &&
    form.percentageShare.trim()
  )
}

function VehicleFormFields({
  form,
  onChange,
  investors,
  rideTypes,
  makes,
  models,
  disabled,
}: {
  form: VehicleFormState
  onChange: (field: keyof VehicleFormState, value: string) => void
  investors: InvestorDTO[]
  rideTypes: RideTypeDTO[]
  makes: VehicleMakeDTO[]
  models: VehicleModelDTO[]
  disabled?: boolean
}) {
  const filteredModels = useMemo(
    () =>
      models.filter(
        (m) => m.vehicleMake.identifier === form.vehicleMakeIdentifier
      ),
    [models, form.vehicleMakeIdentifier]
  )

  function handleMakeChange(makeId: string) {
    onChange("vehicleMakeIdentifier", makeId)
    onChange("vehicleModelIdentifier", "")
  }

  return (
    <FieldGroup className="gap-5">
      {/* Investor */}
      <Field>
        <FieldLabel className="text-sm font-medium">Investor</FieldLabel>
        <Select
          value={form.investorIdentifier}
          onValueChange={(v) => onChange("investorIdentifier", v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select investor" />
          </SelectTrigger>
          <SelectContent>
            {investors.map((inv) => (
              <SelectItem key={inv.identifier} value={inv.identifier}>
                {inv.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Ride type */}
      <Field>
        <FieldLabel className="text-sm font-medium">Ride type</FieldLabel>
        <Select
          value={form.rideTypeIdentifier}
          onValueChange={(v) => onChange("rideTypeIdentifier", v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select ride type" />
          </SelectTrigger>
          <SelectContent>
            {rideTypes.map((rt) => (
              <SelectItem key={rt.identifier} value={rt.identifier}>
                {rt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Vehicle make + model */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel className="text-sm font-medium">Vehicle make</FieldLabel>
          <Select
            value={form.vehicleMakeIdentifier}
            onValueChange={handleMakeChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((mk) => (
                <SelectItem key={mk.identifier} value={mk.identifier}>
                  {mk.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel className="text-sm font-medium">Vehicle model</FieldLabel>
          <Select
            value={form.vehicleModelIdentifier}
            onValueChange={(v) => onChange("vehicleModelIdentifier", v)}
            disabled={disabled || !form.vehicleMakeIdentifier}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue
                placeholder={
                  form.vehicleMakeIdentifier
                    ? "Select model"
                    : "Pick a make first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No models for this make
                </SelectItem>
              ) : (
                filteredModels.map((mdl) => (
                  <SelectItem key={mdl.identifier} value={mdl.identifier}>
                    {mdl.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Color + plate */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="veh-color" className="text-sm font-medium">
            Color
          </FieldLabel>
          <Input
            id="veh-color"
            value={form.colorOfVehicle}
            onChange={(e) => onChange("colorOfVehicle", e.target.value)}
            placeholder="e.g. black"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="veh-plate" className="text-sm font-medium">
            Plate number
          </FieldLabel>
          <Input
            id="veh-plate"
            value={form.plateNumber}
            onChange={(e) => onChange("plateNumber", e.target.value)}
            placeholder="e.g. ABC-123-XY"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
      </div>

      {/* Seat capacity + percentage share */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="veh-seats" className="text-sm font-medium">
            Seat capacity
          </FieldLabel>
          <Input
            id="veh-seats"
            type="number"
            min={1}
            value={form.seatCapacity}
            onChange={(e) => onChange("seatCapacity", e.target.value)}
            placeholder="e.g. 4"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="veh-share" className="text-sm font-medium">
            Percentage share (%)
          </FieldLabel>
          <Input
            id="veh-share"
            type="number"
            min={0}
            max={100}
            value={form.percentageShare}
            onChange={(e) => onChange("percentageShare", e.target.value)}
            placeholder="e.g. 70"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
      </div>
    </FieldGroup>
  )
}

export function InvestorVehiclesSection({
  investorVehicles,
  investors,
  rideTypes,
  makes,
  models,
}: {
  investorVehicles: InvestorVehicleDTO[]
  investors: InvestorDTO[]
  rideTypes: RideTypeDTO[]
  makes: VehicleMakeDTO[]
  models: VehicleModelDTO[]
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<InvestorVehicleDTO | null>(
    null
  )

  const [createForm, setCreateForm] = useState<VehicleFormState>(() =>
    emptyForm(investors, rideTypes, makes)
  )
  const [editForm, setEditForm] = useState<VehicleFormState>(() =>
    emptyForm(investors, rideTypes, makes)
  )

  const [pending, startTransition] = useTransition()

  function updateCreateField(field: keyof VehicleFormState, value: string) {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateEditField(field: keyof VehicleFormState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setCreateForm(emptyForm(investors, rideTypes, makes))
    setCreateOpen(true)
  }

  function openEdit(vehicle: InvestorVehicleDTO) {
    setEditVehicle(vehicle)
    setEditForm({
      investorIdentifier: vehicle.investor.identifier,
      rideTypeIdentifier: vehicle.rideType.identifier,
      vehicleMakeIdentifier: vehicle.vehicleMake.identifier,
      vehicleModelIdentifier: vehicle.vehicleModel.identifier,
      colorOfVehicle: vehicle.colorOfVehicle,
      plateNumber: vehicle.plateNumber,
      seatCapacity: String(vehicle.seatCapacity),
      percentageShare: parseFloat(vehicle.percentageShare).toString(),
    })
  }

  function submitCreate() {
    startTransition(async () => {
      const result = await createInvestorVehicle({
        investorIdentifier: createForm.investorIdentifier,
        rideTypeIdentifier: createForm.rideTypeIdentifier,
        vehicleMakeIdentifier: createForm.vehicleMakeIdentifier,
        vehicleModelIdentifier: createForm.vehicleModelIdentifier,
        colorOfVehicle: createForm.colorOfVehicle.trim(),
        plateNumber: createForm.plateNumber.trim(),
        seatCapacity: createForm.seatCapacity.trim(),
        percentageShare: parseFloat(createForm.percentageShare),
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
    if (!editVehicle) return
    startTransition(async () => {
      const result = await updateInvestorVehicle({
        identifier: editVehicle.identifier,
        body: {
          investorIdentifier: editForm.investorIdentifier,
          rideTypeIdentifier: editForm.rideTypeIdentifier,
          vehicleMakeIdentifier: editForm.vehicleMakeIdentifier,
          vehicleModelIdentifier: editForm.vehicleModelIdentifier,
          colorOfVehicle: editForm.colorOfVehicle.trim(),
          plateNumber: editForm.plateNumber.trim(),
          seatCapacity: editForm.seatCapacity.trim(),
          percentageShare: parseFloat(editForm.percentageShare),
        },
      })
      if (result.success) {
        toast.success(result.message)
        setEditVehicle(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Vehicles staked by investors, their ride types, and share percentages.
        </p>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          Add vehicle
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Investor</TableHead>
              <TableHead className="font-medium">Ride type</TableHead>
              <TableHead className="font-medium">Make / Model</TableHead>
              <TableHead className="font-medium">Plate</TableHead>
              <TableHead className="font-medium">Color</TableHead>
              <TableHead className="font-medium">Seats</TableHead>
              <TableHead className="font-medium">Share %</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investorVehicles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No investor vehicles yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              investorVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">
                    {vehicle.investor.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.rideType.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.vehicleMake.name} {vehicle.vehicleModel.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {vehicle.plateNumber}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {vehicle.colorOfVehicle}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {vehicle.seatCapacity}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {parseFloat(vehicle.percentageShare).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(vehicle)}
                      aria-label={`Edit ${vehicle.plateNumber}`}
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

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Add investor vehicle
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Stake a new vehicle to an investor with a share percentage.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <VehicleFormFields
              form={createForm}
              onChange={updateCreateField}
              investors={investors}
              rideTypes={rideTypes}
              makes={makes}
              models={models}
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
            <Button
              type="button"
              onClick={submitCreate}
              disabled={pending || !isFormValid(createForm)}
            >
              {pending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editVehicle}
        onOpenChange={(open) => !open && setEditVehicle(null)}
      >
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit investor vehicle
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the vehicle details or reassign to another investor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <VehicleFormFields
              form={editForm}
              onChange={updateEditField}
              investors={investors}
              rideTypes={rideTypes}
              makes={makes}
              models={models}
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditVehicle(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitEdit}
              disabled={pending || !isFormValid(editForm)}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
