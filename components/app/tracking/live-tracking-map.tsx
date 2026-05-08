"use client"

import { useEffect, useRef, useState } from "react"
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps"
import { io, Socket } from "socket.io-client"
import { IconCar, IconWifi, IconWifiOff } from "@tabler/icons-react"
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

interface DriverLocation {
  bookingIdentifier: string
  driverFullName: string
  customerFullName: string
  lat: number
  lng: number
}

type DriverMap = Record<string, DriverLocation>

function parseCoords(str: string): { lat: number; lng: number } | null {
  const [latStr, lngStr] = str.split(",")
  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (isNaN(lat) || isNaN(lng)) return null
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

export function LiveTrackingMap() {
  const [connected, setConnected] = useState(false)
  const [drivers, setDrivers] = useState<DriverMap>({})
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io("https://api.stage.metride.app")
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

      setDrivers((prev) => ({
        ...prev,
        [data.driver.identifier]: {
          bookingIdentifier: data.identifier,
          driverFullName: data.driver.fullName,
          customerFullName: data.customer.fullName,
          ...coords,
        },
      }))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const driverEntries = Object.entries(drivers)

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}>
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={selectedCity}
          defaultZoom={13}
          gestureHandling="greedy"
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? ""}
        >
          <MapController center={selectedCity} />

          {driverEntries.map(([driverId, driver]) => (
            <AdvancedMarker
              key={driverId}
              position={{ lat: driver.lat, lng: driver.lng }}
              title={`Customer: ${driver.customerFullName}`}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                  <IconCar size={13} />
                  <span>{driver.driverFullName}</span>
                </div>
                <div className="mx-auto h-2 w-px bg-primary/70" />
                <div className="h-2 w-2 rounded-full bg-primary shadow" />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

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
            {driverEntries.length} active driver
            {driverEntries.length !== 1 ? "s" : ""}
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
            <p className="text-sm font-medium">No active drivers</p>
            <p className="text-xs text-muted-foreground">
              Waiting for live location updates…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
