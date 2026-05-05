"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { IconDotsVertical } from "@tabler/icons-react"
import { DriverWalletTransactionDTO } from "@/actions/wallet/listDriverTransactions"
import { formatNaira } from "@/lib/format-currency"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function TransactionActions({ tx }: { tx: DriverWalletTransactionDTO }) {
  if (!tx.providerTransactionReference) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(tx.providerTransactionReference!)
          }
        >
          Copy provider reference
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const driverTransactionColumns: ColumnDef<DriverWalletTransactionDTO>[] =
  [
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
      cell: ({ row }) => {
        const { amount, typeOfTransaction } = row.original
        return (
          <span
            className={
              typeOfTransaction === "credit"
                ? "font-semibold text-green-600"
                : "font-semibold text-red-600"
            }
          >
            {typeOfTransaction === "credit" ? "+" : "-"}
            {formatNaira(amount)}
          </span>
        )
      },
    },
    {
      id: "Type",
      accessorKey: "typeOfTransaction",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.typeOfTransaction
        return (
          <Badge
            variant="outline"
            className={
              type === "credit"
                ? "border-green-200 bg-green-100 capitalize text-green-700"
                : "border-red-200 bg-red-100 capitalize text-red-700"
            }
          >
            {type}
          </Badge>
        )
      },
    },
    {
      id: "Status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const styles: Record<string, string> = {
          completed: "border-green-200 bg-green-100 text-green-700",
          pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
          failed: "border-red-200 bg-red-100 text-red-700",
        }
        return (
          <Badge
            variant="outline"
            className={`capitalize ${styles[status] ?? ""}`}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "Remark",
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[220px] text-sm text-muted-foreground">
          {row.original.remark}
        </span>
      ),
    },
    {
      id: "System Reference",
      accessorKey: "systemGeneratedTransactionReference",
      header: "System Reference",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.systemGeneratedTransactionReference.slice(0, 8)}…
        </span>
      ),
    },
    {
      id: "Provider Reference",
      accessorKey: "providerTransactionReference",
      header: "Provider Ref.",
      cell: ({ row }) => {
        const ref = row.original.providerTransactionReference
        return ref ? (
          <span className="font-mono text-xs">{ref}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
      cell: ({ row }) => <TransactionActions tx={row.original} />,
    },
  ]
