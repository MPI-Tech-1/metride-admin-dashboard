"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { IconDotsVertical } from "@tabler/icons-react"
import { Eye } from "lucide-react"
import Link from "next/link"
import { ListCustomerDTO } from "@/actions/customers/listCustomers"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function CustomerActions({ customer }: { customer: ListCustomerDTO }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/customers/${customer.identifier}`}>
            <Eye className="size-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(customer.identifier)}
        >
          Copy customer ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(customer.email)}
        >
          Copy email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const customerColumns: ColumnDef<ListCustomerDTO>[] = [
  {
    id: "Customer",
    accessorKey: "firstName",
    header: "Customer",
    cell: ({ row }) => {
      const { firstName, lastName, email } = row.original
      return (
        <div>
          <p className="font-medium">{`${firstName} ${lastName}`}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      )
    },
  },
  {
    id: "Mobile Number",
    accessorKey: "mobileNumber",
    header: "Mobile Number",
    cell: ({ row }) => <span>{row.original.mobileNumber}</span>,
  },
  {
    id: "Last Seen",
    accessorKey: "lastLoggedInAt",
    header: "Last Seen",
    cell: ({ row }) => {
      const date = row.original.lastLoggedInAt
      if (!date) return <span className="text-muted-foreground">Never</span>
      return (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
]
