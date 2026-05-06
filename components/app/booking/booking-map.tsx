"use client"

import { useEffect } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps"

function parseCoords(str: string): { lat: number; lng: number } {
  const [lat, lng] = str.split(",").map(Number)
  return { lat, lng }
}

function GpsPolyline({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || points.length < 2) return
    const poly = new window.google.maps.Polyline({
      path: points,
      strokeColor: "#3B82F6",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    })
    poly.setMap(map)
    return () => {
      poly.setMap(null)
    }
  }, [map, points])

  return null
}

interface BookingMapProps {
  departureCoordinates: string
  destinationCoordinates: string
  gpsLogs: { identifier: string; gpsCoordinates: string }[]
}

export function BookingMap({
  departureCoordinates,
  destinationCoordinates,
  gpsLogs,
}: BookingMapProps) {
  const departure = parseCoords(departureCoordinates)
  const destination = parseCoords(destinationCoordinates)
  const logPoints = gpsLogs.map((l) => parseCoords(l.gpsCoordinates))

  const center = {
    lat: (departure.lat + destination.lat) / 2,
    lng: (departure.lng + destination.lng) / 2,
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}>
      <Map
        style={{ width: "100%", height: "400px" }}
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="cooperative"
      >
        {/* Departure — green */}
        <AdvancedMarker position={departure} title="Departure">
          <div className="h-5 w-5 rounded-full border-2 border-white bg-green-500 shadow-lg" />
        </AdvancedMarker>

        {/* Destination — red */}
        <AdvancedMarker position={destination} title="Destination">
          <div className="h-5 w-5 rounded-full border-2 border-white bg-red-500 shadow-lg" />
        </AdvancedMarker>

        {/* GPS log points — blue */}
        {logPoints.map((pos, i) => (
          <AdvancedMarker key={i} position={pos} title={`GPS Log ${i + 1}`}>
            <div className="h-3 w-3 rounded-full border border-white bg-blue-500 shadow" />
          </AdvancedMarker>
        ))}

        <GpsPolyline points={logPoints} />
      </Map>
    </APIProvider>
  )
}
