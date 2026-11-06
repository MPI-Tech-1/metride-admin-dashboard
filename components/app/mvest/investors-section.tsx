"use client"

import { useState, useTransition } from "react"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import type { InvestorDTO } from "@/actions/mvest/listInvestors"
import createInvestor from "@/actions/mvest/createInvestor"
import updateInvestor from "@/actions/mvest/updateInvestor"
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

interface InvestorFormState {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  address: string
}

const EMPTY_FORM: InvestorFormState = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  address: "",
}

function isFormValid(form: InvestorFormState) {
  return (
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.mobileNumber.trim() &&
    form.address.trim()
  )
}

function InvestorFormFields({
  form,
  onChange,
  disabled,
}: {
  form: InvestorFormState
  onChange: (field: keyof InvestorFormState, value: string) => void
  disabled?: boolean
}) {
  return (
    <FieldGroup className="gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="inv-first-name" className="text-sm font-medium">
            First name
          </FieldLabel>
          <Input
            id="inv-first-name"
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="Jane"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="inv-last-name" className="text-sm font-medium">
            Last name
          </FieldLabel>
          <Input
            id="inv-last-name"
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Alex"
            disabled={disabled}
            required
            className="h-9"
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="inv-email" className="text-sm font-medium">
          Email
        </FieldLabel>
        <Input
          id="inv-email"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="jane@example.com"
          disabled={disabled}
          required
          className="h-9"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="inv-phone" className="text-sm font-medium">
          Mobile number
        </FieldLabel>
        <Input
          id="inv-phone"
          type="tel"
          value={form.mobileNumber}
          onChange={(e) => onChange("mobileNumber", e.target.value)}
          placeholder="08012345678"
          disabled={disabled}
          required
          className="h-9"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="inv-address" className="text-sm font-medium">
          Address
        </FieldLabel>
        <Input
          id="inv-address"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Lagos House"
          disabled={disabled}
          required
          className="h-9"
        />
      </Field>
    </FieldGroup>
  )
}

export function InvestorsSection({ investors }: { investors: InvestorDTO[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editInvestor, setEditInvestor] = useState<InvestorDTO | null>(null)

  const [createForm, setCreateForm] = useState<InvestorFormState>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<InvestorFormState>(EMPTY_FORM)

  const [pending, startTransition] = useTransition()

  function updateCreateField(field: keyof InvestorFormState, value: string) {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateEditField(field: keyof InvestorFormState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setCreateForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  function openEdit(investor: InvestorDTO) {
    setEditInvestor(investor)
    setEditForm({
      firstName: investor.firstName,
      lastName: investor.lastName,
      email: investor.email,
      mobileNumber: investor.mobileNumber,
      address: investor.address,
    })
  }

  function submitCreate() {
    startTransition(async () => {
      const result = await createInvestor({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        mobileNumber: createForm.mobileNumber.trim(),
        address: createForm.address.trim(),
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
    if (!editInvestor) return
    startTransition(async () => {
      const result = await updateInvestor({
        identifier: editInvestor.identifier,
        body: {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
          mobileNumber: editForm.mobileNumber.trim(),
          address: editForm.address.trim(),
        },
      })
      if (result.success) {
        toast.success(result.message)
        setEditInvestor(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Registered investors who hold stakes in vehicles and earn ride shares.
        </p>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          Add investor
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Mobile</TableHead>
              <TableHead className="font-medium">Address</TableHead>
              <TableHead className="font-medium">Joined</TableHead>
              <TableHead className="w-[72px] text-right font-medium"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No investors yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              investors.map((investor) => (
                <TableRow
                  key={investor.identifier}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium">
                    {investor.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {investor.email}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {investor.mobileNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {investor.address}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(investor.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(investor)}
                      aria-label={`Edit ${investor.fullName}`}
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
              Add investor
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Register a new investor to the Mvest programme.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <InvestorFormFields
              form={createForm}
              onChange={updateCreateField}
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
        open={!!editInvestor}
        onOpenChange={(open) => !open && setEditInvestor(null)}
      >
        <DialogContent className="gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="space-y-2 pb-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Edit investor
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the investor&apos;s details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <InvestorFormFields
              form={editForm}
              onChange={updateEditField}
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 border-t border-border/80 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditInvestor(null)}
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
