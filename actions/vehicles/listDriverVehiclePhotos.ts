"use server"

import httpClientInstance from "@/actions/http-client"
import type PaginationMeta from "@/types/pagination-meta"

export type VehiclePhotoSection = "front" | "side" | "back" | "interior"

export interface VehiclePhotoDTO {
  identifier: string
  section: VehiclePhotoSection
  photoUrl: string
  createdAt: string
}

interface ListVehiclePhotosResponse {
  status_code: number
  status: string
  message: string
  results: {
    photos: VehiclePhotoDTO[]
    paginationMeta: PaginationMeta
  }
}

export default async function listDriverVehiclePhotos({
  driverIdentifier,
  page = 1,
  limit = 100,
}: {
  driverIdentifier: string
  page?: number
  limit?: number
}): Promise<{
  photos: VehiclePhotoDTO[]
  paginationMeta: PaginationMeta
}> {
  const { data } = await httpClientInstance.get<ListVehiclePhotosResponse>(
    `/admins/vehicle-management/vehicle-photos`,
    { params: { page, limit, driverIdentifier } }
  )
  return {
    photos: data.results.photos,
    paginationMeta: data.results.paginationMeta,
  }
}
