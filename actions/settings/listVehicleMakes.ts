"use server"

import httpClientInstance from "@/actions/http-client"

export interface VehicleMakeDTO {
  identifier: string
  name: string
}

interface ListVehicleMakesResponse {
  status_code: number
  status: string
  message: string
  results: {
    vehicleMakes: VehicleMakeDTO[]
  }
}

export default async function listVehicleMakes(): Promise<VehicleMakeDTO[]> {
  const { data } = await httpClientInstance.get<ListVehicleMakesResponse>(
    `/settings/vehicles/vehicle-makes`
  )
  return data.results.vehicleMakes
}
