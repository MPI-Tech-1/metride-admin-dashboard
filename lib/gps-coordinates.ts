/**
 * Parse GPS strings from the API or manual entry:
 * "lat, lng", "lat,lng", "lat; lng", or two whitespace-separated numbers.
 */
export function splitGpsParts(value: string): { lat: string; lng: string } {
  const trimmed = value.trim().replace(/;/g, ",")
  if (!trimmed) return { lat: "", lng: "" }

  const commaParts = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (commaParts.length >= 2) {
    return { lat: commaParts[0]!, lng: commaParts[1]! }
  }

  const spaceParts = trimmed.split(/\s+/).filter(Boolean)
  if (spaceParts.length >= 2) {
    return { lat: spaceParts[0]!, lng: spaceParts[1]! }
  }

  return { lat: trimmed, lng: "" }
}

export function joinGps(lat: string, lng: string) {
  return `${lat.trim()}, ${lng.trim()}`
}

export function isValidGpsPair(value: string): boolean {
  const { lat, lng } = splitGpsParts(value)
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return false
  if (la < -90 || la > 90 || ln < -180 || ln > 180) return false
  return true
}

/** Normalize a valid pair to a single canonical string for controlled inputs. */
export function canonicalGpsString(raw: string): string {
  const t = raw.trim()
  if (!isValidGpsPair(t)) return t
  const { lat, lng } = splitGpsParts(t)
  return joinGps(lat, lng)
}
