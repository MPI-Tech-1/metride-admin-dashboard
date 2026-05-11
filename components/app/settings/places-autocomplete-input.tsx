"use client"

import { useEffect, useRef } from "react"
import { useMapsLibrary } from "@vis.gl/react-google-maps"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PlaceSelection {
  name: string
  latitude: string
  longitude: string
  formattedAddress?: string
}

interface PlacesAutocompleteInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  onPlaceSelected: (place: PlaceSelection) => void
  /** Bump when the host dialog opens so Autocomplete rebinds to the input */
  instanceKey?: number | string
}

export function PlacesAutocompleteInput({
  className,
  onPlaceSelected,
  instanceKey,
  disabled,
  ...inputProps
}: PlacesAutocompleteInputProps) {
  const placesLib = useMapsLibrary("places")
  const inputRef = useRef<HTMLInputElement>(null)
  const onPlaceSelectedRef = useRef(onPlaceSelected)
  onPlaceSelectedRef.current = onPlaceSelected

  useEffect(() => {
    if (!placesLib || disabled || !inputRef.current) return

    const input = inputRef.current
    const Autocomplete = placesLib.Autocomplete
    const autocomplete = new Autocomplete(input, {
      fields: ["geometry", "name", "formatted_address"],
    })

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      const loc = place.geometry?.location
      if (!loc) return

      const lat = loc.lat()
      const lng = loc.lng()
      if (lat == null || lng == null) return

      onPlaceSelectedRef.current({
        name: place.name ?? place.formatted_address ?? "",
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        formattedAddress: place.formatted_address ?? undefined,
      })
    })

    return () => {
      google.maps.event.removeListener(listener)
      google.maps.event.clearInstanceListeners(autocomplete)
    }
  }, [placesLib, disabled, instanceKey])

  return (
    <Input
      ref={inputRef}
      disabled={disabled || !placesLib}
      className={cn(className)}
      autoComplete="off"
      {...inputProps}
    />
  )
}
