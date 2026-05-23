"use client"

import { useEffect, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import createAdmin from "@/actions/userManagement/createAdmin"
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
import { ROLES, ROLE_LABELS, type Role } from "@/lib/permissions"

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CreateAdminDialog({
  open,
  onOpenChange,
}: CreateAdminDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("operations")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) {
      setFirstName("")
      setLastName("")
      setEmail("")
      setRole("operations")
    }
  }, [open])

  const trimmedFirstName = firstName.trim()
  const trimmedLastName = lastName.trim()
  const trimmedEmail = email.trim()
  const isValid =
    trimmedFirstName.length > 0 &&
    trimmedLastName.length > 0 &&
    EMAIL_PATTERN.test(trimmedEmail)

  function handleSubmit() {
    if (!isValid) {
      toast.error("Fill in every field with valid values.")
      return
    }

    startTransition(async () => {
      const result = await createAdmin({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        role,
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      onOpenChange(false)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add admin</DialogTitle>
          <DialogDescription>
            Login credentials are emailed to the new admin. They&apos;ll see
            only the pages allowed for their role.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={isPending}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={isPending}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@metride.app"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
              disabled={isPending}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    <div className="flex flex-col">
                      <span className="font-medium">{ROLE_LABELS[r]}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {roleAccessDescription(r)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending || !isValid}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function roleAccessDescription(role: Role): string {
  switch (role) {
    case "admin":
      return "Full access — manages users, settings, and everything else."
    case "operations":
      return "Drivers, customers, bookings, live tracking."
    case "finance":
      return "Wallets and payouts."
  }
}
