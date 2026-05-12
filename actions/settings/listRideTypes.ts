"use server"

import httpClientInstance from "@/actions/http-client"

export interface RideTypeDTO {
  identifier: string
  name: string
  description: string
  numberOfSeats: number
  pricePerKilometer: number
  basePrice: number
  minimumPrice: number
}

interface ListRideTypesResponse {
  status_code: number
  status: string
  message: string
  results: {
    rideTypes: RideTypeDTO[]
  }
}

export default async function listRideTypes(): Promise<RideTypeDTO[]> {
  const { data } = await httpClientInstance.get<ListRideTypesResponse>(
    `/settings/booking/ride-types`
  )
  return data.results.rideTypes
}
