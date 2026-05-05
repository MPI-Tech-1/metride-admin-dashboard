"use client"

import { useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { IconDotsVertical } from "@tabler/icons-react"
import { toast } from "sonner"
import { DriverWithdrawalRequestDTO } from "@/actions/wallet/listDriverWithdrawalRequests"
import { formatNaira } from "@/lib/format-currency"
import approveWithdrawalRequest from "@/actions/wallet/approveWithdrawalRequest"
import rejectWithdrawalRequest from "@/actions/wallet/rejectWithdrawalRequest"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function PayoutActions({ row }: { row: DriverWithdrawalRequestDTO }) {
  const [approving, startApprove] = useTransition()
  const [rejecting, startReject] = useTransition()

  const isPending = row.status === "pending"
  const busy = approving || rejecting

  async function handleApprove() {
    startApprove(async () => {
      const result = await approveWithdrawalRequest(row.identifier)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  async function handleReject() {
    startReject(async () => {
      const result = await rejectWithdrawalRequest(row.identifier)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (!isPending) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          disabled={busy}
          className="text-green-600 focus:text-green-600"
          onClick={handleApprove}
        >
          {approving ? "Approving…" : "Approve"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={busy}
          className="text-red-600 focus:text-red-600"
          onClick={handleReject}
        >
          {rejecting ? "Rejecting…" : "Reject"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const statusStyles: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
  approved: "border-green-200 bg-green-100 text-green-700",
  rejected: "border-red-200 bg-red-100 text-red-700",
}

export const payoutsColumns: ColumnDef<DriverWithdrawalRequestDTO>[] = [
  {
    id: "Driver",
    accessorKey: "driver",
    header: "Driver",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.driver.fullName}</span>
    ),
  },
  {
    id: "Amount",
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold">{formatNaira(row.original.amount)}</span>
    ),
  },
  {
    id: "Status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant="outline"
          className={`capitalize ${statusStyles[status] ?? ""}`}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "Date",
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.createdAt), {
          addSuffix: true,
        })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => <PayoutActions row={row.original} />,
  },
]
