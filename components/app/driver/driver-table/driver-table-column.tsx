// columns/driver-columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconCircleCheckFilled,
  IconLoader,
  IconDotsVertical,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Eye } from "lucide-react"

export type Driver = {
  id: number
  name: string
  status: "Active" | "Inactive" | "Suspended"
  trips: number
  rating: number
  acceptanceRate: string
  cancellationRate: string
  earnings: string
}

function DriverActions({ driver }: { driver: Driver }) {
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
          <Link href="#">
            <Eye /> View
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const driverColumns: ColumnDef<Driver>[] = [
  {
    accessorKey: "name",
    header: "Driver",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const isActive = status === "Active"
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {isActive ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : (
            <IconLoader />
          )}
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: "trips", header: "Total Trips" },
  { accessorKey: "rating", header: "Avg. Rating" },
  { accessorKey: "acceptanceRate", header: "Acceptance Rate" },
  { accessorKey: "cancellationRate", header: "Cancellation Rate" },
  { accessorKey: "earnings", header: "Avg. Earnings / Trip" },
  {
    id: "actions",
    cell: ({ row }) => <DriverActions driver={row.original} />,
  },
]
