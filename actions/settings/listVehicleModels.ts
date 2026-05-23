"use server"

import httpClientInstance from "@/actions/http-client"

export interface VehicleModelMakeRef {
  identifier: string
  name: string
}

export interface VehicleModelDTO {
  identifier: string
  name: string
  vehicleMake: VehicleModelMakeRef
}

interface ListVehicleModelsResponse {
  status_code: number
  status: string
  message: string
  results: {
    vehicleModels: VehicleModelDTO[]
  }
}

export default async function listVehicleModels(): Promise<VehicleModelDTO[]> {
  const { data } = await httpClientInstance.get<ListVehicleModelsResponse>(
    `/admins/settings/vehicles/vehicle-models`
  )
  return data.results.vehicleModels
}
