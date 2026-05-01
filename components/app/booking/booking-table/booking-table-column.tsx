"use client"

import { useTransition, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow, format } from "date-fns"
import { IconDotsVertical } from "@tabler/icons-react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { ListBookingDTO } from "@/actions/bookings/listBookings"
import cancelBooking from "@/actions/bookings/cancelBooking"
import completeBooking from "@/actions/bookings/completeBooking"
import { AssignDriverModal } from "@/components/app/booking/assign-driver-modal"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
    created: "outline",
    "assigned-a-driver": "default",
    cancelled: "destructive",
  }
  if (status === "completed") {
    return (
      <Badge className="border-green-200 bg-green-100 capitalize text-green-700">
        completed
      </Badge>
    )
  }
  return (
    <Badge variant={variants[status] ?? "outline"} className="capitalize">
      {status.replace(/-/g, " ")}
    </Badge>
  )
}

function TripProgressBadge({ progress }: { progress: string }) {
  const colors: Record<string, string> = {
    "not-started": "bg-muted text-muted-foreground border-border",
    "heading-to-pickup": "bg-blue-100 text-blue-700 border-blue-200",
    "picked-up": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "trip-ended": "bg-green-100 text-green-700 border-green-200",
  }
  return (
    <Badge
      variant="outline"
      className={`capitalize ${colors[progress] ?? ""}`}
    >
      {progress.replace(/-/g, " ")}
    </Badge>
  )
}

function BookingRowActions({ booking }: { booking: ListBookingDTO }) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [isCancelling, startCancel] = useTransition()
  const [isCompleting, startComplete] = useTransition()

  function handleCancel() {
    startCancel(async () => {
      const result = await cancelBooking(booking.identifier)
      if (result.success) {
        toast.success(result.message)
        setCancelOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleComplete() {
    startComplete(async () => {
      const result = await completeBooking(booking.identifier)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(booking.identifier)}
          >
            Copy booking ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>View customer</DropdownMenuItem>
          {!booking.assignedDriver && (
            <DropdownMenuItem onClick={() => setAssignOpen(true)}>
              Assign driver
            </DropdownMenuItem>
          )}
          {booking.assignedDriver && (
            <DropdownMenuItem>View driver</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-3 animate-spin" />
                Completing…
              </span>
            ) : (
              "Complete booking"
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            Cancel booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignDriverModal
        bookingIdentifier={booking.identifier}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={!isCancelling}>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isCancelling}
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="size-3 animate-spin" />
                  Cancelling…
                </span>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const bookingColumns: ColumnDef<ListBookingDTO>[] = [
  {
    id: "Customer",
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const { firstName, lastName, email } = row.original.customer
      return (
        <div className="min-w-[140px]">
          <p className="font-medium">{`${firstName} ${lastName}`}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      )
    },
  },
  {
    id: "Type",
    accessorKey: "typeOfBooking",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant={row.original.typeOfBooking === "shuttle" ? "default" : "secondary"}
        className="capitalize"
      >
        {row.original.typeOfBooking}
      </Badge>
    ),
  },
  {
    id: "Status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "Trip Progress",
    accessorKey: "tripProgress",
    header: "Trip Progress",
    cell: ({ row }) => <TripProgressBadge progress={row.original.tripProgress} />,
  },
  {
    id: "Ride Type",
    accessorKey: "rideType",
    header: "Ride Type",
    cell: ({ row }) => {
      const { name, numberOfSeats } = row.original.rideType
      return (
        <div className="min-w-[100px]">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {numberOfSeats} seat{numberOfSeats !== 1 ? "s" : ""}
          </p>
        </div>
      )
    },
  },
  {
    id: "Departure",
    accessorKey: "departureLocation",
    header: "Departure",
    cell: ({ row }) => {
      const { name, type } = row.original.departureLocation
      return (
        <div className="min-w-[160px]">
          <p className="line-clamp-1 max-w-[200px] font-medium">{name}</p>
          <p className="text-xs capitalize text-muted-foreground">{type}</p>
        </div>
      )
    },
  },
  {
    id: "Destination",
    accessorKey: "destinationLocation",
    header: "Destination",
    cell: ({ row }) => {
      const { name, type } = row.original.destinationLocation
      return (
        <div className="min-w-[160px]">
          <p className="line-clamp-1 max-w-[200px] font-medium">{name}</p>
          <p className="text-xs capitalize text-muted-foreground">{type}</p>
        </div>
      )
    },
  },
  {
    id: "Assigned Driver",
    accessorKey: "assignedDriver",
    header: "Assigned Driver",
    cell: ({ row }) => {
      const driver = row.original.assignedDriver
      if (!driver) {
        return <span className="text-muted-foreground">Unassigned</span>
      }
      return (
        <div>
          <p className="font-medium">{`${driver.firstName} ${driver.lastName}`}</p>
          <p className="text-xs text-muted-foreground">{driver.email}</p>
        </div>
      )
    },
  },
  {
    id: "Payment",
    accessorKey: "bookingPayment",
    header: "Payment",
    cell: ({ row }) => {
      const { paymentMethod, basePrice, paymentStatus } = row.original.bookingPayment
      return (
        <div className="min-w-[120px]">
          <p className="font-medium">{formatAmount(basePrice)}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {paymentMethod} · {paymentStatus}
          </p>
        </div>
      )
    },
  },
  {
    id: "Recurring",
    accessorKey: "isRecurringBooking",
    header: "Recurring",
    cell: ({ row }) => {
      const { isRecurringBooking, recurringBookingDates } = row.original
      if (!isRecurringBooking) {
        return <span className="text-muted-foreground">No</span>
      }
      const days = recurringBookingDates.days ?? []
      const weeks = recurringBookingDates.durationInWeeks
      return (
        <div className="min-w-[120px]">
          <p className="text-xs font-medium capitalize">
            {days.map((d) => d.slice(0, 3)).join(", ")}
          </p>
          <p className="text-xs text-muted-foreground">
            {weeks} week{weeks !== 1 ? "s" : ""}
          </p>
        </div>
      )
    },
  },
  {
    id: "Date of Ride",
    accessorKey: "dateOfRide",
    header: "Date of Ride",
    cell: ({ row }) => {
      const date = row.original.dateOfRide
      if (!date) return <span className="text-muted-foreground">—</span>
      return <span>{format(new Date(date), "MMM d, yyyy")}</span>
    },
  },
  {
    id: "Booked",
    accessorKey: "createdAt",
    header: "Booked",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
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
    cell: ({ row }) => <BookingRowActions booking={row.original} />,
  },
]
