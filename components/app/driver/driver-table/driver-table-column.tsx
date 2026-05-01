import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconCircleCheckFilled,
  IconLoader,
  IconDotsVertical,
  IconCircleX,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Eye } from "lucide-react"
import { ListDriverDTO } from "@/actions/drivers/listDrivers"
import { formatDistanceToNow } from "date-fns"

function DriverActions({ driver }: { driver: ListDriverDTO }) {
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
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem asChild>
          <Link href={`/drivers/${driver.identifier}`}>
            <Eye /> View
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const driverColumns: ColumnDef<ListDriverDTO>[] = [
  {
    accessorKey: "Full Name",
    header: "Full Name",
    cell: ({ row }) => (
      <span>{`${row.original.firstName} ${row.original.lastName}`}</span>
    ),
  },
  {
    accessorKey: "Email Address",
    header: "Email Address",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "Mobile Number",
    header: "Mobile Number",
    cell: ({ row }) => <span>{row.original.mobileNumber}</span>,
  },
  {
    accessorKey: "Last Logged In At",
    header: "Last Logged In At",
    cell: ({ row }) => (
      <span>
        {row.original.lastLoggedInAt
          ? formatDistanceToNow(new Date(row.original.lastLoggedInAt), {
              addSuffix: true,
            })
          : "Never"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status

      const statuses = {
        approved: (
          <span className="flex items-center">
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            Approved
          </span>
        ),
        rejected: (
          <span className="flex items-center">
            <IconCircleX className="fill-red-500 dark:fill-red-400" /> Rejected
          </span>
        ),
        pending: (
          <span className="flex items-center">
            <IconLoader /> Pending Approval
          </span>
        ),
      }
      return (
        <Badge variant="outline" className="p-5 text-muted-foreground">
          {statuses[status]}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DriverActions driver={row.original} />,
  },
]
