"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import type { BankDTO } from "@/actions/mvest/finance"
import { resolveBankAccount } from "@/actions/mvest/finance"
import {
  createOwner,
  type MvestOwnerDTO,
  type OwnerStatus,
} from "@/actions/mvest/owners"
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
import { Field, FieldLabel } from "@/components/ui/field"
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
import type PaginationMeta from "@/types/pagination-meta"

interface OwnerForm {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  password: string
  status: OwnerStatus
  bankCode: string
  accountName: string
  accountNumber: string
}

const emptyForm: OwnerForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  password: "",
  status: "active",
  bankCode: "",
  accountName: "",
  accountNumber: "",
}

export function OwnersView({
  owners,
  banks,
  paginationMeta,
  initialSearch,
  initialStatus,
}: {
  owners: MvestOwnerDTO[]
  banks: BankDTO[]
  paginationMeta: PaginationMeta
  initialSearch: string
  initialStatus: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<OwnerForm>(emptyForm)
  const [accountVerified, setAccountVerified] = useState(false)
  const [pending, startTransition] = useTransition()

  function update<K extends keyof OwnerForm>(key: K, value: OwnerForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === "accountNumber" || key === "bankCode") {
      setAccountVerified(false)
      setForm((current) => ({ ...current, accountName: "" }))
    }
  }

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }

  function resolveAccount() {
    if (!form.bankCode || form.accountNumber.trim().length !== 10) {
      toast.error("Choose a bank and enter a 10-digit account number.")
      return
    }
    startTransition(async () => {
      const result = await resolveBankAccount({
        accountNumber: form.accountNumber.trim(),
        bankCode: form.bankCode,
      })
      if (!result.success || !result.accountName) {
        setAccountVerified(false)
        toast.error(result.message)
        return
      }
      setForm((current) => ({
        ...current,
        accountName: result.accountName ?? "",
        accountNumber: result.accountNumber ?? current.accountNumber,
      }))
      setAccountVerified(true)
      toast.success("Bank account verified.")
    })
  }

  function submit() {
    const bank = banks.find((item) => item.bankCode === form.bankCode)
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.mobileNumber.trim() ||
      form.password.length < 8
    ) {
      toast.error("Complete all personal details. Password needs 8+ characters.")
      return
    }
    if (!bank || !accountVerified || !form.accountName) {
      toast.error("Resolve and verify the owner's bank account first.")
      return
    }
    startTransition(async () => {
      const result = await createOwner({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber.trim(),
        password: form.password,
        status: form.status,
        bankName: bank.name,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">MVest owners</h1>
          <p className="text-sm text-muted-foreground">
            Manage vehicle owners and their verified payout accounts.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm)
            setAccountVerified(false)
            setOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add owner
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-64 flex-1 gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate({ search, page: "1" })
            }}
            placeholder="Search owner"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ search, page: "1" })}
            aria-label="Search owners"
          >
            <Search className="size-4" />
          </Button>
        </div>
        <Select
          value={initialStatus || "all"}
          onValueChange={(value) =>
            navigate({
              status: value === "all" ? undefined : value,
              page: "1",
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table className="min-w-[850px]">
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Account name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.length ? (
              owners.map((owner) => (
                <TableRow key={owner.identifier}>
                  <TableCell className="font-medium">
                    {owner.firstName} {owner.lastName}
                  </TableCell>
                  <TableCell>
                    <div>{owner.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {owner.mobileNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{owner.bankName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {owner.accountNumber}
                    </div>
                  </TableCell>
                  <TableCell>{owner.accountName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={owner.status === "active" ? "default" : "secondary"}
                      className={
                        owner.status === "active"
                          ? "bg-emerald-600 text-white"
                          : undefined
                      }
                    >
                      {owner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {owner.lastLoggedInAt
                      ? new Date(owner.lastLoggedInAt).toLocaleString("en-NG")
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No owners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {paginationMeta.total} owner{paginationMeta.total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={paginationMeta.currentPage <= 1}
            onClick={() =>
              navigate({ page: String(paginationMeta.currentPage - 1) })
            }
          >
            Previous
          </Button>
          <span>
            Page {paginationMeta.currentPage} of{" "}
            {Math.max(1, paginationMeta.lastPage)}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={paginationMeta.currentPage >= paginationMeta.lastPage}
            onClick={() =>
              navigate({ page: String(paginationMeta.currentPage + 1) })
            }
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add MVest owner</DialogTitle>
            <DialogDescription>
              Create login details and verify the payout account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["firstName", "First name", "Ada"],
                ["lastName", "Last name", "Owner"],
                ["email", "Email", "owner@example.com"],
                ["mobileNumber", "Mobile number", "08000000000"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <Field key={key}>
                <FieldLabel htmlFor={`owner-${key}`}>{label}</FieldLabel>
                <Input
                  id={`owner-${key}`}
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(event) => update(key, event.target.value)}
                  placeholder={placeholder}
                  disabled={pending}
                />
              </Field>
            ))}
            <Field>
              <FieldLabel htmlFor="owner-password">Temporary password</FieldLabel>
              <Input
                id="owner-password"
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  update("status", value as OwnerStatus)
                }
                disabled={pending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Payout account</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Bank</FieldLabel>
                <Select
                  value={form.bankCode}
                  onValueChange={(value) => update("bankCode", value)}
                  disabled={pending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.identifier} value={bank.bankCode}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="owner-account-number">
                  Account number
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="owner-account-number"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.accountNumber}
                    onChange={(event) =>
                      update(
                        "accountNumber",
                        event.target.value.replace(/\D/g, "")
                      )
                    }
                    disabled={pending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resolveAccount}
                    disabled={pending}
                  >
                    Resolve
                  </Button>
                </div>
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="owner-account-name">
                  Account name
                </FieldLabel>
                <Input
                  id="owner-account-name"
                  value={form.accountName}
                  readOnly
                  placeholder="Resolved account name"
                  className={
                    accountVerified
                      ? "border-emerald-500 bg-emerald-500/5"
                      : undefined
                  }
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={pending || !accountVerified}>
              {pending ? "Creating…" : "Create owner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
