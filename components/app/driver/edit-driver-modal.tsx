"use client"

import { useState, useTransition } from "react"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import updateDriver, {
  type UpdateDriverPayload,
} from "@/actions/drivers/updateDriver"
import type { CityDTO } from "@/actions/settings/listCities"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type DriverForm = Required<UpdateDriverPayload>

interface EditDriverModalProps {
  driverId: string
  driver: DriverForm
  cities: CityDTO[]
}

export function EditDriverModal({
  driverId,
  driver,
  cities,
}: EditDriverModalProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<DriverForm>(driver)
  const [isPending, startTransition] = useTransition()

  const setValue = (key: keyof DriverForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))
  const bind = (key: keyof DriverForm) => ({
    id: key,
    value: form[key],
    disabled: isPending,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setValue(key, e.target.value),
  })

  const ninValid =
    !form.nationalIdentificationNumber ||
    /^\d{11}$/.test(form.nationalIdentificationNumber.trim())
  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.mobileNumber.trim() &&
    ninValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    // Send required fields always; send optional fields only when filled so
    // we don't overwrite existing data with empty strings.
    const payload: UpdateDriverPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      mobileNumber: form.mobileNumber.trim(),
    }
    const optional = [
      "cityIdentifier",
      "dateOfBirth",
      "gender",
      "homeAddress",
      "nationalIdentificationNumber",
    ] as const
    for (const key of optional) {
      const v = form[key].trim()
      if (v) payload[key] = v
    }

    startTransition(async () => {
      const result = await updateDriver(driverId, payload)
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
        if (next) setForm(driver)
        setOpen(next)
      }}
    >
      <button
        type="button"
        className="mt-1"
        aria-label="Edit driver information"
        onClick={() => {
          setForm(driver)
          setOpen(true)
        }}
      >
        <Pencil className="h-4 w-4 text-gray-500 hover:text-foreground" />
      </button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit driver</DialogTitle>
            <DialogDescription>
              Update this driver&apos;s account and personal information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name">
              <Input {...bind("firstName")} />
            </Field>
            <Field id="lastName" label="Last name">
              <Input {...bind("lastName")} />
            </Field>
            <Field id="email" label="Email">
              <Input type="email" {...bind("email")} />
            </Field>
            <Field id="mobileNumber" label="Mobile number">
              <Input type="tel" placeholder="+234..." {...bind("mobileNumber")} />
            </Field>
            <Field id="dateOfBirth" label="Date of birth">
              <Input type="date" {...bind("dateOfBirth")} />
            </Field>
            <Field id="gender" label="Gender">
              <Select
                value={form.gender}
                onValueChange={(v) => setValue("gender", v)}
                disabled={isPending}
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="cityIdentifier" label="City">
              <Select
                value={form.cityIdentifier}
                onValueChange={(v) => setValue("cityIdentifier", v)}
                disabled={isPending || cities.length === 0}
              >
                <SelectTrigger id="cityIdentifier" className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.identifier} value={city.identifier}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              id="nationalIdentificationNumber"
              label="NIN"
              error={ninValid ? undefined : "NIN must be 11 digits."}
            >
              <Input
                inputMode="numeric"
                maxLength={11}
                {...bind("nationalIdentificationNumber")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="homeAddress" label="Home address">
                <Textarea rows={2} {...bind("homeAddress")} />
              </Field>
            </div>
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
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
