"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pencil, Plus, Power } from "lucide-react"
import { toast } from "sonner"

import createPromotion, {
  type PromotionPayload,
} from "@/actions/promotions/createPromotion"
import type {
  ApplicableBookingType,
  DiscountType,
  PromotionDTO,
} from "@/actions/promotions/listPromotions"
import updatePromotion from "@/actions/promotions/updatePromotion"
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
import { Textarea } from "@/components/ui/textarea"
import { formatNaira } from "@/lib/format-currency"
import type PaginationMeta from "@/types/pagination-meta"

interface PromotionFormState {
  code: string
  name: string
  description: string
  discountType: DiscountType
  discountValue: string
  maximumDiscountNaira: string
  minimumBookingNaira: string
  globalUsageLimit: string
  usageLimitPerCustomer: string
  applicableBookingType: ApplicableBookingType
  startsAt: string
  endsAt: string
  isActive: boolean
}

const emptyForm: PromotionFormState = {
  code: "",
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maximumDiscountNaira: "",
  minimumBookingNaira: "0",
  globalUsageLimit: "",
  usageLimitPerCustomer: "1",
  applicableBookingType: "all",
  startsAt: "",
  endsAt: "",
  isActive: true,
}

function nairaToKobo(raw: string, allowEmpty = false): number | null {
  const cleaned = raw.replace(/,/g, "").trim()
  if (!cleaned) return allowEmpty ? null : Number.NaN
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return Number.NaN
  return Math.round(value * 100)
}

function koboToNaira(kobo: number | null): string {
  if (kobo === null) return ""
  return String(kobo / 100)
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function promotionToForm(promotion: PromotionDTO): PromotionFormState {
  return {
    code: promotion.code,
    name: promotion.name,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue:
      promotion.discountType === "fixed"
        ? koboToNaira(promotion.discountValue)
        : String(promotion.discountValue),
    maximumDiscountNaira: koboToNaira(promotion.maximumDiscountAmount),
    minimumBookingNaira: koboToNaira(promotion.minimumBookingAmount),
    globalUsageLimit: String(promotion.globalUsageLimit),
    usageLimitPerCustomer: String(promotion.usageLimitPerCustomer),
    applicableBookingType: promotion.applicableBookingType,
    startsAt: toDateTimeLocal(promotion.startsAt),
    endsAt: toDateTimeLocal(promotion.endsAt),
    isActive: promotion.isActive,
  }
}

function parsePositiveInteger(raw: string): number | null {
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : null
}

function parseForm(
  form: PromotionFormState
): { ok: true; payload: PromotionPayload } | { ok: false; message: string } {
  const code = form.code.trim().toUpperCase()
  const name = form.name.trim()
  if (!code || !name) {
    return { ok: false, message: "Code and name are required." }
  }

  const rawDiscount = Number(form.discountValue.replace(/,/g, ""))
  let discountValue: number
  if (form.discountType === "percentage") {
    if (!Number.isFinite(rawDiscount) || rawDiscount <= 0 || rawDiscount > 100) {
      return {
        ok: false,
        message: "Percentage discount must be greater than 0 and at most 100.",
      }
    }
    discountValue = rawDiscount
  } else {
    const fixedKobo = nairaToKobo(form.discountValue)
    if (!Number.isFinite(fixedKobo) || (fixedKobo as number) <= 0) {
      return {
        ok: false,
        message: "Fixed discount must be a naira amount greater than 0.",
      }
    }
    discountValue = fixedKobo as number
  }

  const maximumDiscountAmount = nairaToKobo(
    form.maximumDiscountNaira,
    true
  )
  const minimumBookingAmount = nairaToKobo(form.minimumBookingNaira)
  if (
    Number.isNaN(maximumDiscountAmount) ||
    !Number.isFinite(minimumBookingAmount)
  ) {
    return { ok: false, message: "Enter valid non-negative naira amounts." }
  }

  const globalUsageLimit = parsePositiveInteger(form.globalUsageLimit)
  const usageLimitPerCustomer = parsePositiveInteger(
    form.usageLimitPerCustomer
  )
  if (!globalUsageLimit || !usageLimitPerCustomer) {
    return {
      ok: false,
      message: "Usage limits must be whole numbers greater than 0.",
    }
  }
  if (usageLimitPerCustomer > globalUsageLimit) {
    return {
      ok: false,
      message: "Per-customer limit cannot exceed the global usage limit.",
    }
  }

  const startsAt = new Date(form.startsAt)
  const endsAt = new Date(form.endsAt)
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    endsAt <= startsAt
  ) {
    return {
      ok: false,
      message: "Choose a valid start and end time; end must be after start.",
    }
  }

  return {
    ok: true,
    payload: {
      code,
      name,
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue,
      maximumDiscountAmount,
      minimumBookingAmount: minimumBookingAmount as number,
      globalUsageLimit,
      usageLimitPerCustomer,
      applicableBookingType: form.applicableBookingType,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      isActive: form.isActive,
    },
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function PromotionFields({
  form,
  setForm,
  disabled,
}: {
  form: PromotionFormState
  setForm: React.Dispatch<React.SetStateAction<PromotionFormState>>
  disabled: boolean
}) {
  function update<K extends keyof PromotionFormState>(
    key: K,
    value: PromotionFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <FieldGroup className="gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="promotion-code">Code</FieldLabel>
          <Input
            id="promotion-code"
            value={form.code}
            onChange={(event) =>
              update("code", event.target.value.toUpperCase())
            }
            placeholder="WELCOME10"
            disabled={disabled}
            className="font-mono uppercase"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="promotion-name">Name</FieldLabel>
          <Input
            id="promotion-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Welcome discount"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="promotion-description">Description</FieldLabel>
        <Textarea
          id="promotion-description"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Short description of the offer"
          rows={2}
          disabled={disabled}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Discount type</FieldLabel>
          <Select
            value={form.discountType}
            onValueChange={(value) =>
              update("discountType", value as DiscountType)
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="promotion-value">
            {form.discountType === "percentage"
              ? "Discount value (%)"
              : "Discount value (₦)"}
          </FieldLabel>
          <Input
            id="promotion-value"
            inputMode="decimal"
            value={form.discountValue}
            onChange={(event) => update("discountValue", event.target.value)}
            placeholder={form.discountType === "percentage" ? "10" : "1000"}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium">Booking amounts (naira)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter amounts in ₦. They are converted to kobo before submission.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="promotion-max">
              Maximum discount (₦)
            </FieldLabel>
            <Input
              id="promotion-max"
              inputMode="decimal"
              value={form.maximumDiscountNaira}
              onChange={(event) =>
                update("maximumDiscountNaira", event.target.value)
              }
              placeholder="Optional"
              disabled={disabled}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="promotion-minimum">
              Minimum booking (₦)
            </FieldLabel>
            <Input
              id="promotion-minimum"
              inputMode="decimal"
              value={form.minimumBookingNaira}
              onChange={(event) =>
                update("minimumBookingNaira", event.target.value)
              }
              placeholder="1000"
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="promotion-global-limit">
            Global usage limit
          </FieldLabel>
          <Input
            id="promotion-global-limit"
            type="number"
            min={1}
            step={1}
            value={form.globalUsageLimit}
            onChange={(event) =>
              update("globalUsageLimit", event.target.value)
            }
            disabled={disabled}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="promotion-customer-limit">
            Per customer
          </FieldLabel>
          <Input
            id="promotion-customer-limit"
            type="number"
            min={1}
            step={1}
            value={form.usageLimitPerCustomer}
            onChange={(event) =>
              update("usageLimitPerCustomer", event.target.value)
            }
            disabled={disabled}
          />
        </Field>
        <Field>
          <FieldLabel>Booking type</FieldLabel>
          <Select
            value={form.applicableBookingType}
            onValueChange={(value) =>
              update(
                "applicableBookingType",
                value as ApplicableBookingType
              )
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All bookings</SelectItem>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="shuttle">Shuttle</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="promotion-start">Starts at</FieldLabel>
          <Input
            id="promotion-start"
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => update("startsAt", event.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="promotion-end">Ends at</FieldLabel>
          <Input
            id="promotion-end"
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => update("endsAt", event.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
        <Checkbox
          id="promotion-active"
          checked={form.isActive}
          onCheckedChange={(checked) => update("isActive", checked === true)}
          disabled={disabled}
        />
        <FieldLabel htmlFor="promotion-active" className="cursor-pointer">
          Promotion is active
        </FieldLabel>
      </div>
    </FieldGroup>
  )
}

export function PromotionsView({
  promotions,
  paginationMeta,
}: {
  promotions: PromotionDTO[]
  paginationMeta: PaginationMeta
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PromotionDTO | null>(null)
  const [form, setForm] = useState<PromotionFormState>(emptyForm)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(promotion: PromotionDTO) {
    setEditing(promotion)
    setForm(promotionToForm(promotion))
    setDialogOpen(true)
  }

  function submit() {
    const parsed = parseForm(form)
    if (!parsed.ok) {
      toast.error(parsed.message)
      return
    }

    startTransition(async () => {
      const result = editing
        ? await updatePromotion(editing.identifier, parsed.payload)
        : await createPromotion(parsed.payload)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setDialogOpen(false)
      router.refresh()
    })
  }

  function toggleActive(promotion: PromotionDTO) {
    startTransition(async () => {
      const result = await updatePromotion(promotion.identifier, {
        isActive: !promotion.isActive,
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  function navigate(page: number, limit = paginationMeta.perPage) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    params.set("limit", String(limit))
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Create discount codes, set booking eligibility, and control usage.
            Money is displayed in naira.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" />
          Create promotion
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="overflow-x-auto rounded-xl border">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Promotion</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Minimum booking</TableHead>
                <TableHead>Booking type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No promotions yet.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promotion) => (
                  <TableRow key={promotion.identifier}>
                    <TableCell>
                      <div className="font-medium">{promotion.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {promotion.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium tabular-nums">
                        {promotion.discountType === "percentage"
                          ? `${promotion.discountValue}%`
                          : formatNaira(promotion.discountValue)}
                      </div>
                      {promotion.maximumDiscountAmount !== null ? (
                        <div className="text-xs text-muted-foreground">
                          Max {formatNaira(promotion.maximumDiscountAmount)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatNaira(promotion.minimumBookingAmount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {promotion.applicableBookingType}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{promotion.globalUsageLimit} total</div>
                      <div className="text-xs text-muted-foreground">
                        {promotion.usageLimitPerCustomer} per customer
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{formatDate(promotion.startsAt)}</div>
                      <div className="text-muted-foreground">
                        to {formatDate(promotion.endsAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={promotion.isActive ? "default" : "secondary"}
                        className={
                          promotion.isActive
                            ? "bg-emerald-600 text-white"
                            : undefined
                        }
                      >
                        {promotion.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(promotion)}
                          disabled={pending}
                          aria-label={`Edit ${promotion.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(promotion)}
                          disabled={pending}
                          aria-label={`${promotion.isActive ? "Deactivate" : "Activate"} ${promotion.name}`}
                        >
                          <Power className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {paginationMeta.total} promotion
            {paginationMeta.total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={String(paginationMeta.perPage)}
              onValueChange={(value) => navigate(1, Number(value))}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={paginationMeta.currentPage <= paginationMeta.firstPage}
              onClick={() => navigate(paginationMeta.currentPage - 1)}
            >
              Previous
            </Button>
            <span className="min-w-24 text-center">
              Page {paginationMeta.currentPage} of{" "}
              {Math.max(1, paginationMeta.lastPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginationMeta.currentPage >= paginationMeta.lastPage}
              onClick={() => navigate(paginationMeta.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit promotion" : "Create promotion"}
            </DialogTitle>
            <DialogDescription>
              Fixed discounts and booking thresholds are entered in naira and
              converted to kobo for the API.
            </DialogDescription>
          </DialogHeader>
          <PromotionFields form={form} setForm={setForm} disabled={pending} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
