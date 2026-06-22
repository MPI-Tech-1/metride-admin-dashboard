"use client"

import { useEffect, useRef, useState } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { IconCar, IconWifi, IconWifiOff } from "@tabler/icons-react"

import type { GoogleMapsClientConfig } from "@/lib/google-maps-client"
import { isGoogleMapsClientReady } from "@/lib/google-maps-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface City {
  name: string
  lat: number
  lng: number
}

const CITIES: City[] = [
  { name: "Maiduguri", lat: 11.847, lng: 13.168 },
  { name: "Abuja", lat: 9.0579, lng: 7.4951 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Kano", lat: 12.0022, lng: 8.592 },
  { name: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
  { name: "Enugu", lat: 6.4584, lng: 7.5464 },
  { name: "Ibadan", lat: 7.3775, lng: 3.947 },
  { name: "Kaduna", lat: 10.526, lng: 7.4394 },
  { name: "Jos", lat: 9.8965, lng: 8.8583 },
  { name: "Benin City", lat: 6.335, lng: 5.6038 },
]

interface BookingDriver {
  bookingIdentifier: string
  driverFullName: string
  customerFullName: string
  lat: number
  lng: number
  path: { lat: number; lng: number }[]
}

type BookingDriverMap = Record<string, BookingDriver>

function parseCoords(str: string): { lat: number; lng: number } | null {
  const [latStr, lngStr] = str.split(",")
  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    map.panTo(center)
  }, [map, center])

  return null
}

function DriverPolylines({
  drivers,
}: {
  drivers: Array<{ id: string; path: { lat: number; lng: number }[] }>
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || drivers.length === 0) return

    const palette = ["#2563EB", "#DC2626", "#16A34A", "#7C3AED", "#EA580C"]
    const overlays: google.maps.Polyline[] = []

    drivers.forEach((driver, index) => {
      if (driver.path.length < 2) return

      const color = palette[index % palette.length]

      const outerPolyline = new window.google.maps.Polyline({
        path: driver.path,
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.95,
        strokeWeight: 8,
        geodesic: true,
      })

      const innerPolyline = new window.google.maps.Polyline({
        path: driver.path,
        strokeColor: color,
        strokeOpacity: 0.95,
        strokeWeight: 4,
        geodesic: true,
      })

      outerPolyline.setMap(map)
      innerPolyline.setMap(map)
      overlays.push(outerPolyline, innerPolyline)
    })

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null))
    }
  }, [map, drivers])

  return null
}

export function LiveTrackingMap({
  googleMaps,
  websocketUrl,
}: {
  googleMaps: GoogleMapsClientConfig
  websocketUrl: string
}) {
  const { data: session } = useSession()
  const [connected, setConnected] = useState(false)
  const [bookingDrivers, setBookingDrivers] = useState<BookingDriverMap>({})
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0])
  const socketRef = useRef<Socket | null>(null)

  const accessToken = session?.user?.accessToken

  useEffect(() => {
    if (!accessToken) return

    const socket = io(websocketUrl, {
      auth: { token: accessToken },
      transports: ["websocket"],
    })
    socketRef.current = socket

    socket.on("connect", () => {
      setConnected(true)
      socket.emit("join", "room:admins")
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })

    socket.on("booking:driver-location", (data) => {
      const coords = parseCoords(data.gpsCoordinates)
      if (!coords) return

      const driverName =
        data.driver.fullName ??
        `${data.driver.firstName ?? ""} ${data.driver.lastName ?? ""}`.trim()
      const customerName =
        data.customer.fullName ??
        `${data.customer.firstName ?? ""} ${data.customer.lastName ?? ""}`.trim()

      setBookingDrivers((prev) => {
        const previousDriver = prev[data.driver.identifier]
        const previousPath = previousDriver?.path ?? []
        const lastPoint = previousPath[previousPath.length - 1]
        const isSamePoint =
          lastPoint?.lat === coords.lat && lastPoint?.lng === coords.lng

        const nextPath = isSamePoint
          ? previousPath
          : [...previousPath, coords].slice(-60)

        return {
          ...prev,
          [data.driver.identifier]: {
            bookingIdentifier: data.identifier,
            driverFullName: driverName,
            customerFullName: customerName,
            ...coords,
            path: nextPath,
          },
        }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [websocketUrl, accessToken])

  const driverEntries = Object.entries(bookingDrivers)
  const showMapsConfigHint = !isGoogleMapsClientReady(googleMaps)

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={googleMaps.apiKey}>
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={selectedCity}
          defaultZoom={13}
          gestureHandling="greedy"
          mapId={googleMaps.mapId}
        >
          <MapController center={selectedCity} />
          <DriverPolylines
            drivers={driverEntries.map(([id, driver]) => ({
              id,
              path: driver.path,
            }))}
          />

          {driverEntries.map(([driverId, driver]) => (
            <AdvancedMarker
              key={driverId}
              position={{ lat: driver.lat, lng: driver.lng }}
              title={driver.driverFullName}
            >
              <div className="group relative flex flex-col items-center">
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-16 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  <p className="font-semibold">{driver.driverFullName}</p>
                  <p className="text-[11px] text-background/70">{driver.customerFullName}</p>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
                {/* Marker */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-xl">
                  <IconCar size={24} />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="mt-0.5 h-2 w-0.5 bg-foreground/40" />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {showMapsConfigHint && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 rounded-lg border border-amber-200/90 bg-amber-50/95 px-3 py-2 text-xs text-amber-950 shadow-lg backdrop-blur-sm dark:border-amber-800/80 dark:bg-amber-950/90 dark:text-amber-50">
          <p className="font-medium leading-snug">
            Maps API key or Map ID missing
          </p>
          <p className="mt-1 leading-relaxed opacity-90">
            Set{" "}
            <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
              GOOGLE_MAPS_API_KEY
            </code>{" "}
            +{" "}
            <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
              GOOGLE_MAPS_MAP_ID
            </code>{" "}
            on the server, or{" "}
            <code className="rounded bg-amber-100/90 px-1 py-px font-mono text-[10px] dark:bg-amber-900/70">
              NEXT_PUBLIC_GOOGLE_MAPS_*
            </code>{" "}
            at build time.
          </p>
        </div>
      )}

      {/* Connection status — top left */}
      <div className="absolute left-3 top-3 flex flex-col gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${
            connected ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {connected ? <IconWifi size={13} /> : <IconWifiOff size={13} />}
          {connected ? "Live" : "Disconnected"}
        </div>

        {driverEntries.length > 0 && (
          <div className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow backdrop-blur-sm">
            {driverEntries.length} driver
            {driverEntries.length !== 1 ? "s" : ""} on a trip
          </div>
        )}
      </div>

      {/* City selector — top right */}
      <div className="absolute right-3 top-3">
        <Select
          value={selectedCity.name}
          onValueChange={(name) => {
            const city = CITIES.find((c) => c.name === name)
            if (city) setSelectedCity(city)
          }}
        >
          <SelectTrigger className="w-44 bg-background/90 shadow backdrop-blur-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city.name} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {connected && driverEntries.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-background/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
            <IconCar size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No drivers on a trip</p>
            <p className="text-xs text-muted-foreground">
              Waiting for live booking pushes…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
