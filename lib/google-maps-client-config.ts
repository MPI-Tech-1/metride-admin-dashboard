import type { GoogleMapsClientConfig } from "@/lib/google-maps-client"

/**
 * Read env at runtime. Next may inline `process.env.NEXT_PUBLIC_*` at build
 * time when written as property access; dynamic keys keep runtime `.env` / host
 * values visible on the server.
 */
function runtimeEnv(name: string): string {
  return (process.env[name] ?? "").trim()
}

/**
 * Values consumed by the Maps JavaScript API in the browser.
 *
 * Prefer `GOOGLE_MAPS_API_KEY` + `GOOGLE_MAPS_MAP_ID` on the host (runtime).
 * `NEXT_PUBLIC_*` is also read here via dynamic lookup so a server `.env` that
 * only appears at deploy time still works without rebuilding for those names.
 *
 * Import this only from Server Components or Route Handlers — not from `"use client"` files.
 */
export function getGoogleMapsClientConfig(): GoogleMapsClientConfig {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    runtimeEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
  const mapId =
    process.env.GOOGLE_MAPS_MAP_ID?.trim() ||
    runtimeEnv("NEXT_PUBLIC_GOOGLE_MAPS_ID")
  return { apiKey, mapId }
}
