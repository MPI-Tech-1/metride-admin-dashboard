"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { VehicleMakeDTO } from "@/actions/settings/listVehicleMakes"
import createVehicleMake from "@/actions/settings/createVehicleMake"
import updateVehicleMake from "@/actions/settings/updateVehicleMake"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function VehicleMakesSection({ makes }: { makes: VehicleMakeDTO[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editMake, setEditMake] = useState<VehicleMakeDTO | null>(null)
  const [makeName, setMakeName] = useState("")
  const [editMakeName, setEditMakeName] = useState("")
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setMakeName("")
    setCreateOpen(true)
  }

  function openEdit(m: VehicleMakeDTO) {
    setEditMake(m)
    setEditMakeName(m.name)
  }

  function submitCreate() {
    const name = makeName.trim()
    if (!name) {
      toast.error("Enter a make name.")
      return
    }
    startTransition(async () => {
      const result = await createVehicleMake({ name })
      if (result.success) {
        toast.success(result.message)
        setCreateOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  function submitEdit() {
    if (!editMake) return
    const name = editMakeName.trim()
    if (!name) {
      toast.error("Enter a make name.")
      return
    }
    startTransition(async () => {
      const result = await updateVehicleMake({
        identifier: editMake.identifier,
        name,
      })
      if (result.success) {
        toast.success(result.message)
        setEditMake(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Manufacturers or brands (e.g. Toyota, BMW). Add specific trims and
          lines under{" "}
          <Link
            href="/settings/vehicle-models"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Vehicle models
          </Link>
          .
        </p>
        <Button type="button" size="sm" className="shrink-0 gap-1.5" onClick={openCreate}>
          <Plus className="size-4" />
          Add make
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {makes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="h-24 text-center text-muted-foreground"
                >
                  No vehicle makes yet.
                </TableCell>
              </TableRow>
            ) : (
              makes.map((m) => (
                <TableRow
                  key={m.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{m.name}</TableCell>
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
              Add vehicle make
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Create a manufacturer or brand name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="vmake-name" className="text-sm font-medium">
                  Name
                </FieldLabel>
                <Input
                  id="vmake-name"
                  value={makeName}
                  onChange={(e) => setMakeName(e.target.value)}
                  placeholder="e.g. Audi"
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

      <Dialog open={!!editMake} onOpenChange={(open) => !open && setEditMake(null)}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-md">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit vehicle make
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the display name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel
                  htmlFor="vmake-edit-name"
                  className="text-sm font-medium"
                >
                  Name
                </FieldLabel>
                <Input
                  id="vmake-edit-name"
                  value={editMakeName}
                  onChange={(e) => setEditMakeName(e.target.value)}
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
              onClick={() => setEditMake(null)}
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
