"use client"

import { useState, useTransition } from "react"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { RideTypeDTO } from "@/actions/settings/listRideTypes"
import createRideType from "@/actions/settings/createRideType"
import updateRideType from "@/actions/settings/updateRideType"
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
import { Textarea } from "@/components/ui/textarea"
import { formatNaira } from "@/lib/format-currency"

/** Naira (from input) → integer kobo, rounded. */
function nairaInputToKobo(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim()
  if (cleaned === "") return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

function koboToNairaField(kobo: number): string {
  const v = kobo / 100
  return Number.isInteger(v) ? String(v) : String(v)
}

function RideTypeFormFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  numberOfSeats,
  onNumberOfSeatsChange,
  pricePerKmNaira,
  onPricePerKmChange,
  basePriceNaira,
  onBasePriceChange,
  minimumPriceNaira,
  onMinimumPriceChange,
  disabled,
}: {
  name: string
  onNameChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  numberOfSeats: string
  onNumberOfSeatsChange: (v: string) => void
  pricePerKmNaira: string
  onPricePerKmChange: (v: string) => void
  basePriceNaira: string
  onBasePriceChange: (v: string) => void
  minimumPriceNaira: string
  onMinimumPriceChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="rt-name" className="text-sm font-medium">
          Name
        </FieldLabel>
        <Input
          id="rt-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Bus"
          disabled={disabled}
          className="h-9"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="rt-desc" className="text-sm font-medium">
          Description
        </FieldLabel>
        <Textarea
          id="rt-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Short description for customers"
          disabled={disabled}
          rows={3}
          className="min-h-[80px] resize-y"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="rt-seats" className="text-sm font-medium">
            Number of seats
          </FieldLabel>
          <Input
            id="rt-seats"
            type="number"
            min={1}
            step={1}
            value={numberOfSeats}
            onChange={(e) => onNumberOfSeatsChange(e.target.value)}
            disabled={disabled}
            className="h-9"
          />
        </Field>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
        <p className="text-xs font-medium text-foreground">Pricing (naira)</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Enter amounts in <span className="font-medium">₦</span>. Values are
          sent to the API as <span className="font-mono">kobo</span> (×100).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="rt-ppk" className="text-xs font-medium">
            Price per kilometer (₦)
          </FieldLabel>
          <Input
            id="rt-ppk"
            inputMode="decimal"
            value={pricePerKmNaira}
            onChange={(e) => onPricePerKmChange(e.target.value)}
            placeholder="2500"
            disabled={disabled}
            className="h-9 font-mono tabular-nums"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="rt-base" className="text-xs font-medium">
            Base price (₦)
          </FieldLabel>
          <Input
            id="rt-base"
            inputMode="decimal"
            value={basePriceNaira}
            onChange={(e) => onBasePriceChange(e.target.value)}
            placeholder="1000"
            disabled={disabled}
            className="h-9 font-mono tabular-nums"
          />
        </Field>
        <Field className="min-[420px]:col-span-2">
          <FieldLabel htmlFor="rt-min" className="text-xs font-medium">
            Minimum price (₦)
          </FieldLabel>
          <Input
            id="rt-min"
            inputMode="decimal"
            value={minimumPriceNaira}
            onChange={(e) => onMinimumPriceChange(e.target.value)}
            placeholder="500"
            disabled={disabled}
            className="h-9 max-w-md font-mono tabular-nums"
          />
        </Field>
      </div>
    </FieldGroup>
  )
}

function parseRideTypePayload(
  name: string,
  description: string,
  numberOfSeats: string,
  pricePerKmNaira: string,
  basePriceNaira: string,
  minimumPriceNaira: string
):
  | {
      ok: true
      payload: {
        name: string
        description: string
        numberOfSeats: number
        pricePerKilometer: number
        basePrice: number
        minimumPrice: number
      }
    }
  | { ok: false; message: string } {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { ok: false, message: "Name is required." }
  }
  const seats = Number.parseInt(numberOfSeats, 10)
  if (!Number.isFinite(seats) || seats < 1) {
    return { ok: false, message: "Enter a valid number of seats (≥ 1)." }
  }

  const ppk = nairaInputToKobo(pricePerKmNaira)
  const base = nairaInputToKobo(basePriceNaira)
  const min = nairaInputToKobo(minimumPriceNaira)

  if (ppk === null || base === null || min === null) {
    return {
      ok: false,
      message: "Enter valid naira amounts for all price fields.",
    }
  }

  return {
    ok: true,
    payload: {
      name: trimmedName,
      description: description.trim(),
      numberOfSeats: seats,
      pricePerKilometer: ppk,
      basePrice: base,
      minimumPrice: min,
    },
  }
}

export function RideTypesSection({ rideTypes }: { rideTypes: RideTypeDTO[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editRt, setEditRt] = useState<RideTypeDTO | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [numberOfSeats, setNumberOfSeats] = useState("4")
  const [pricePerKmNaira, setPricePerKmNaira] = useState("")
  const [basePriceNaira, setBasePriceNaira] = useState("")
  const [minimumPriceNaira, setMinimumPriceNaira] = useState("")

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editSeats, setEditSeats] = useState("")
  const [editPpk, setEditPpk] = useState("")
  const [editBase, setEditBase] = useState("")
  const [editMin, setEditMin] = useState("")

  const [pending, startTransition] = useTransition()

  function openCreate() {
    setName("")
    setDescription("")
    setNumberOfSeats("4")
    setPricePerKmNaira("")
    setBasePriceNaira("")
    setMinimumPriceNaira("")
    setCreateOpen(true)
  }

  function openEdit(rt: RideTypeDTO) {
    setEditRt(rt)
    setEditName(rt.name)
    setEditDescription(rt.description)
    setEditSeats(String(rt.numberOfSeats))
    setEditPpk(koboToNairaField(rt.pricePerKilometer))
    setEditBase(koboToNairaField(rt.basePrice))
    setEditMin(koboToNairaField(rt.minimumPrice))
  }

  function submitCreate() {
    const parsed = parseRideTypePayload(
      name,
      description,
      numberOfSeats,
      pricePerKmNaira,
      basePriceNaira,
      minimumPriceNaira
    )
    if (!parsed.ok) {
      toast.error(parsed.message)
      return
    }
    startTransition(async () => {
      const result = await createRideType(parsed.payload)
      if (result.success) {
        toast.success(result.message)
        setCreateOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  function submitEdit() {
    if (!editRt) return
    const parsed = parseRideTypePayload(
      editName,
      editDescription,
      editSeats,
      editPpk,
      editBase,
      editMin
    )
    if (!parsed.ok) {
      toast.error(parsed.message)
      return
    }
    startTransition(async () => {
      const result = await updateRideType({
        identifier: editRt.identifier,
        ...parsed.payload,
      })
      if (result.success) {
        toast.success(result.message)
        setEditRt(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Vehicle categories, seating, and fares. Prices are stored in{" "}
          <span className="font-mono text-xs">kobo</span> and shown in naira.
        </p>
        <Button type="button" size="sm" className="shrink-0 gap-1.5" onClick={openCreate}>
          <Plus className="size-4" />
          Add ride type
        </Button>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="hidden min-w-[180px] font-medium md:table-cell">
                Description
              </TableHead>
              <TableHead className="w-[64px] text-right font-medium">Seats</TableHead>
              <TableHead className="whitespace-nowrap text-right font-medium">
                / km
              </TableHead>
              <TableHead className="whitespace-nowrap text-right font-medium">
                Base
              </TableHead>
              <TableHead className="whitespace-nowrap text-right font-medium">
                Min
              </TableHead>
              <TableHead className="w-[64px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rideTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No ride types yet.
                </TableCell>
              </TableRow>
            ) : (
              rideTypes.map((rt) => (
                <TableRow
                  key={rt.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">{rt.name}</TableCell>
                  <TableCell className="hidden max-w-[240px] truncate text-sm text-muted-foreground md:table-cell">
                    {rt.description}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {rt.numberOfSeats}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatNaira(rt.pricePerKilometer)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatNaira(rt.basePrice)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatNaira(rt.minimumPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(rt)}
                      aria-label={`Edit ${rt.name}`}
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
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Add ride type
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Define seating and prices. Money fields are naira; the API receives
              kobo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <RideTypeFormFields
              name={name}
              onNameChange={setName}
              description={description}
              onDescriptionChange={setDescription}
              numberOfSeats={numberOfSeats}
              onNumberOfSeatsChange={setNumberOfSeats}
              pricePerKmNaira={pricePerKmNaira}
              onPricePerKmChange={setPricePerKmNaira}
              basePriceNaira={basePriceNaira}
              onBasePriceChange={setBasePriceNaira}
              minimumPriceNaira={minimumPriceNaira}
              onMinimumPriceChange={setMinimumPriceNaira}
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

      <Dialog open={!!editRt} onOpenChange={(open) => !open && setEditRt(null)}>
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit ride type
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update copy, capacity, or fares. Amounts in naira; API uses kobo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <RideTypeFormFields
              name={editName}
              onNameChange={setEditName}
              description={editDescription}
              onDescriptionChange={setEditDescription}
              numberOfSeats={editSeats}
              onNumberOfSeatsChange={setEditSeats}
              pricePerKmNaira={editPpk}
              onPricePerKmChange={setEditPpk}
              basePriceNaira={editBase}
              onBasePriceChange={setEditBase}
              minimumPriceNaira={editMin}
              onMinimumPriceChange={setEditMin}
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditRt(null)}
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
