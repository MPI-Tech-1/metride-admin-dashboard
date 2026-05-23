"use server"

import httpClientInstance from "@/actions/http-client"

export interface CityDTO {
  identifier: string
  name: string
  longitude: string
  latitude: string
}

interface ListCitiesResponse {
  status_code: number
  status: string
  message: string
  results: {
    cities: CityDTO[]
  }
}

export default async function listCities(): Promise<CityDTO[]> {
  const { data } = await httpClientInstance.get<ListCitiesResponse>(
    `/admins/settings/cities`
  )
  return data.results.cities
}
