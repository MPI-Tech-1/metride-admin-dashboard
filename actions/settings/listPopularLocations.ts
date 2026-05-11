"use server"

import httpClientInstance from "@/actions/http-client"

export interface PopularLocationCity {
  identifier: string
  name: string
  longitude: string
  latitude: string
}

export interface PopularLocationDTO {
  identifier: string
  city: PopularLocationCity
  name: string
  gpsCoordinates: string
  typeOfLocation: string
  isActive: boolean
}

interface ListPopularLocationsResponse {
  status_code: number
  status: string
  message: string
  results: {
    popularLocationPayload: PopularLocationDTO[]
  }
}

export default async function listPopularLocations(): Promise<
  PopularLocationDTO[]
> {
  const { data } = await httpClientInstance.get<ListPopularLocationsResponse>(
    `/settings/booking/popular-locations`
  )
  return data.results.popularLocationPayload
}
