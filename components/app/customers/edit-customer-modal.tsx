"use client"

import { useState, useTransition } from "react"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import updateCustomer, {
  type UpdateCustomerPayload,
} from "@/actions/customers/updateCustomer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditCustomerModalProps {
  customerId: string
  customer: UpdateCustomerPayload
}

export function EditCustomerModal({
  customerId,
  customer,
}: EditCustomerModalProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<UpdateCustomerPayload>(customer)
  const [isPending, startTransition] = useTransition()

  const set = (key: keyof UpdateCustomerPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.mobileNumber.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    startTransition(async () => {
      const result = await updateCustomer(customerId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber.trim(),
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setOpen(false)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        if (next) setForm(customer)
        setOpen(next)
      }}
    >
      <Button variant="outline" onClick={() => {
        setForm(customer)
        setOpen(true)
      }}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit customer
      </Button>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update this customer&apos;s account details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name">
              <Input id="firstName" value={form.firstName} onChange={set("firstName")} disabled={isPending} />
            </Field>
            <Field id="lastName" label="Last name">
              <Input id="lastName" value={form.lastName} onChange={set("lastName")} disabled={isPending} />
            </Field>
            <Field id="email" label="Email">
              <Input id="email" type="email" value={form.email} onChange={set("email")} disabled={isPending} />
            </Field>
            <Field id="mobileNumber" label="Mobile number">
              <Input id="mobileNumber" type="tel" placeholder="+234..." value={form.mobileNumber} onChange={set("mobileNumber")} disabled={isPending} />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
