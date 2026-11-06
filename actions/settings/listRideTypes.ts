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
  isActive: boolean
}

interface RideTypeApiResponse {
  identifier: string
  name: string
  description: string
  numberOfSeats: number
  pricePerKilometer: number
  basePrice: number
  minimumPrice: number
  isActive?: boolean
  is_active?: boolean
}

interface ListRideTypesResponse {
  status_code: number
  status: string
  message: string
  results: {
    rideTypes: RideTypeApiResponse[]
  }
}

export default async function listRideTypes(): Promise<RideTypeDTO[]> {
  const { data } = await httpClientInstance.get<ListRideTypesResponse>(
    `/admins/settings/booking/ride-types`
  )

  return data.results.rideTypes.map((rideType) => ({
    ...rideType,
    isActive: rideType.isActive ?? rideType.is_active ?? false,
  }))
}
