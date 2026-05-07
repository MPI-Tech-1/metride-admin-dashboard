"use client"

import { useEffect, useRef, useState } from "react"
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps"
import { io, Socket } from "socket.io-client"
import { IconCar, IconWifi, IconWifiOff } from "@tabler/icons-react"

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

const DEFAULT_CENTER = { lat: 11.847, lng: 13.168 }

export function LiveTrackingMap() {
  const [connected, setConnected] = useState(false)
  const [drivers, setDrivers] = useState<DriverMap>({})
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
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={13}
          gestureHandling="greedy"
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? ""}
        >
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

      {/* Connection status */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
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

      {/* Empty state when connected but no drivers */}
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
