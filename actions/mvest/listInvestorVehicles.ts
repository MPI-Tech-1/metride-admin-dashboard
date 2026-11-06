"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

interface InvestorRef {
  identifier: string
  firstName: string
  lastName: string
  fullName: string
  email: string
}

interface RideTypeRef {
  identifier: string
  name: string
}

interface VehicleMakeRef {
  identifier: string
  name: string
}

interface VehicleModelRef {
  identifier: string
  name: string
}

export interface InvestorVehicleDTO {
  identifier: string
  investor: InvestorRef
  rideType: RideTypeRef
  vehicleMake: VehicleMakeRef
  vehicleModel: VehicleModelRef
  colorOfVehicle: string
  plateNumber: string
  seatCapacity: number
  percentageShare: string
  createdAt: string
}

interface ListInvestorVehiclesResponse {
  status_code: number
  status: string
  message: string
  results: {
    investorVehicles: InvestorVehicleDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listInvestorVehicles(
  page = 1,
  limit = 100
): Promise<{ investorVehicles: InvestorVehicleDTO[]; paginationMeta: PaginationMeta }> {
  const { data } = await httpClientInstance.get<ListInvestorVehiclesResponse>(
    `/admins/investment-management/investor-vehicles`,
    { params: { page, limit } }
  )
  return data.results
}
