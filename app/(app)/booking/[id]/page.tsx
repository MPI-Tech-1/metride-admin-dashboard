export const dynamic = "force-dynamic"

import { format, formatDistanceToNow } from "date-fns"
import {
  IconArrowRight,
  IconCalendar,
  IconCar,
  IconClock,
  IconCreditCard,
  IconMapPin,
  IconRoute,
  IconStar,
  IconUser,
} from "@tabler/icons-react"
import getBooking from "@/actions/bookings/getBooking"
import AppLayout from "@/components/layouts/app-layout"
import { BookingMap } from "@/components/app/booking/booking-map"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { formatNaira } from "@/lib/format-currency"

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return (
      <Badge className="border-green-200 bg-green-100 capitalize text-green-700">
        completed
      </Badge>
    )
  if (status === "cancelled")
    return <Badge variant="destructive">cancelled</Badge>
  return (
    <Badge variant="outline" className="capitalize">
      {status.replace(/-/g, " ")}
    </Badge>
  )
}

function TripProgressBadge({ progress }: { progress: string }) {
  const colors: Record<string, string> = {
    "not-started": "bg-muted text-muted-foreground border-border",
    "heading-to-pickup": "bg-blue-100 text-blue-700 border-blue-200",
    "picked-up": "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-green-100 text-green-700 border-green-200",
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

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const booking = await getBooking(id)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Bookings", href: "/booking" },
    { title: "Booking Details", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {booking.identifier.slice(0, 8)}…
            </Badge>
            <Badge
              variant={booking.typeOfBooking === "shuttle" ? "default" : "secondary"}
              className="capitalize"
            >
              {booking.typeOfBooking}
            </Badge>
            <StatusBadge status={booking.status} />
            <TripProgressBadge progress={booking.tripProgress} />
          </div>
          <p className="text-sm text-muted-foreground">
            Created{" "}
            {formatDistanceToNow(new Date(booking.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Route */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconRoute size={18} />
                  Route
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Departure
                  </p>
                  <div className="flex items-start gap-2">
                    <IconMapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-green-500"
                    />
                    <div>
                      <p className="font-medium">
                        {booking.departureLocationName}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {booking.departureLocationType}
                      </p>
                    </div>
                  </div>
                </div>

                <IconArrowRight
                  size={18}
                  className="hidden shrink-0 self-center text-muted-foreground sm:block"
                />

                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Destination
                  </p>
                  <div className="flex items-start gap-2">
                    <IconMapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <div>
                      <p className="font-medium">
                        {booking.destinationLocationName}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {booking.destinationLocationType}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="flex items-center gap-1.5 text-sm">
                    <IconRoute size={14} className="text-muted-foreground" />
                    <span>{formatDistance(booking.estimatedDistanceInMeters)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <IconClock size={14} className="text-muted-foreground" />
                    <span>{formatDuration(booking.estimatedDurationInSeconds)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {booking.bookingReviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconStar size={18} />
                    Reviews ({booking.bookingReviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {booking.bookingReviews.map((review) => (
                    <div key={review.identifier} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IconStar
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      {review.review && (
                        <p className="text-sm text-muted-foreground">
                          "{review.review}"
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconMapPin size={18} />
                  GPS Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <BookingMap
                  departureCoordinates={booking.departureLocationGpsCoordinates}
                  destinationCoordinates={booking.destinationLocationGpsCoordinates}
                  gpsLogs={booking.bookingGpsLogs}
                />
                <div className="flex flex-wrap gap-4 px-6 py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                    Departure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                    Destination
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                    GPS Logs
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconCalendar size={18} />
                  Booking Info
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{booking.typeOfBooking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip Progress</span>
                  <TripProgressBadge progress={booking.tripProgress} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Ride</span>
                  <span>
                    {booking.dateOfRide
                      ? format(new Date(booking.dateOfRide), "MMM d, yyyy")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recurring</span>
                  <span>{booking.isRecurringBooking ? "Yes" : "No"}</span>
                </div>
                {booking.isRecurringBooking &&
                  booking.recurringBookingDates.days && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days</span>
                      <span>
                        {booking.recurringBookingDates.days
                          .map((d) => d.slice(0, 3))
                          .join(", ")}
                      </span>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Assigned Driver */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconUser size={18} />
                  Assigned Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {booking.assignedDriver ? (
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {booking.assignedDriver.firstName}{" "}
                      {booking.assignedDriver.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {booking.assignedDriver.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No driver assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconCreditCard size={18} />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>{formatNaira(booking.bookingPayment.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className={booking.bookingPayment.discountAmount > 0 ? "text-green-600" : ""}>
                    -{formatNaira(booking.bookingPayment.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Amount Paid</span>
                  <span>{formatNaira(booking.bookingPayment.amountPaid)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Ride Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconCar size={18} />
                  Ride Type
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="font-medium">{booking.rideType.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.rideType.description}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span>{booking.rideType.numberOfSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price / km</span>
                  <span>{formatNaira(booking.rideType.pricePerKilometer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>{formatNaira(booking.rideType.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Price</span>
                  <span>{formatNaira(booking.rideType.minimumPrice)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
