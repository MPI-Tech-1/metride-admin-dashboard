"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { VehicleMakeDTO } from "@/actions/settings/listVehicleMakes"
import type { VehicleModelDTO } from "@/actions/settings/listVehicleModels"
import createVehicleModel from "@/actions/settings/createVehicleModel"
import updateVehicleModel from "@/actions/settings/updateVehicleModel"
import { Badge } from "@/components/ui/badge"
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

export function VehicleModelsSection({
  makes,
  models,
}: {
  makes: VehicleMakeDTO[]
  models: VehicleModelDTO[]
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editModel, setEditModel] = useState<VehicleModelDTO | null>(null)
  const [modelName, setModelName] = useState("")
  const [modelMakeId, setModelMakeId] = useState("")
  const [editModelName, setEditModelName] = useState("")
  const [editModelMakeId, setEditModelMakeId] = useState("")
  const [pending, startTransition] = useTransition()

  const makesForEditSelect = useMemo(() => {
    if (!editModel) return makes
    if (makes.some((m) => m.identifier === editModel.vehicleMake.identifier)) {
      return makes
    }
    return [
      {
        identifier: editModel.vehicleMake.identifier,
        name: editModel.vehicleMake.name,
      },
      ...makes,
    ]
  }, [makes, editModel])

  function openCreate() {
    setModelName("")
    setModelMakeId(makes[0]?.identifier ?? "")
    setCreateOpen(true)
  }

  function openEdit(m: VehicleModelDTO) {
    setEditModel(m)
    setEditModelName(m.name.trim())
    setEditModelMakeId(m.vehicleMake.identifier)
  }

  function submitCreate() {
    const name = modelName.trim()
    if (!name || !modelMakeId) {
      toast.error("Select a make and enter a model name.")
      return
    }
    startTransition(async () => {
      const result = await createVehicleModel({
        name,
        vehicleMakeIdentifier: modelMakeId,
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
    if (!editModel) return
    const name = editModelName.trim()
    if (!name || !editModelMakeId) {
      toast.error("Select a make and enter a model name.")
      return
    }
    startTransition(async () => {
      const result = await updateVehicleModel({
        identifier: editModel.identifier,
        name,
        vehicleMakeIdentifier: editModelMakeId,
      })
      if (result.success) {
        toast.success(result.message)
        setEditModel(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Models linked to a make (e.g. Camry under Toyota). Add makes first on{" "}
          <Link
            href="/settings/vehicle-makes"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Vehicle makes
          </Link>
          .
        </p>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={openCreate}
          disabled={makes.length === 0}
        >
          <Plus className="size-4" />
          Add model
        </Button>
      </div>

      {makes.length === 0 && (
        <p className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Add at least one vehicle make on{" "}
          <Link
            href="/settings/vehicle-makes"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Vehicle makes
          </Link>{" "}
          before creating models.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Model</TableHead>
              <TableHead className="font-medium">Make</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No vehicle models yet.
                </TableCell>
              </TableRow>
            ) : (
              models.map((m) => (
                <TableRow
                  key={m.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {m.vehicleMake.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(m)}
                      aria-label={`Edit ${m.name}`}
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
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-md">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Add vehicle model
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Choose the make and enter the model name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel className="text-sm font-medium">Make</FieldLabel>
                <Select
                  value={modelMakeId}
                  onValueChange={setModelMakeId}
                  disabled={pending || makes.length === 0}
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
                <FieldLabel htmlFor="vmodel-name" className="text-sm font-medium">
                  Model name
                </FieldLabel>
                <Input
                  id="vmodel-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Camry"
                  disabled={pending}
                  className="h-9"
                />
              </Field>
            </FieldGroup>
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

      <Dialog open={!!editModel} onOpenChange={(open) => !open && setEditModel(null)}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-md">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit vehicle model
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Change the model name or reassign it to another make.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel className="text-sm font-medium">Make</FieldLabel>
                <Select
                  value={editModelMakeId}
                  onValueChange={setEditModelMakeId}
                  disabled={pending}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makesForEditSelect.map((mk) => (
                      <SelectItem key={mk.identifier} value={mk.identifier}>
                        {mk.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="vmodel-edit-name"
                  className="text-sm font-medium"
                >
                  Model name
                </FieldLabel>
                <Input
                  id="vmodel-edit-name"
                  value={editModelName}
                  onChange={(e) => setEditModelName(e.target.value)}
                  disabled={pending}
                  className="h-9"
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModel(null)}
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
