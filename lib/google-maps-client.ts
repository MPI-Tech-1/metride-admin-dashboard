/** API key + Map ID passed from the server into client map components. */
export type GoogleMapsClientConfig = {
  apiKey: string
  mapId: string
}

export function isGoogleMapsClientReady(config: GoogleMapsClientConfig): boolean {
  return Boolean(config.apiKey && config.mapId)
}
