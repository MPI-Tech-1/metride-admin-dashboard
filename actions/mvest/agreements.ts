"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import httpClientInstance from "@/actions/http-client"

export interface AvailableVehicleDTO {
  driverVehicleIdentifier: string
  plateNumber: string
  vehicleMake: string
  vehicleModel: string
  driverFirstName: string
  driverLastName: string
}

interface AvailableVehicleApiDTO {
  driver_vehicle_identifier: string
  plate_number: string
  vehicle_make: string
  vehicle_model: string
  driver_first_name: string
  driver_last_name: string
}

export async function listAvailableVehicles({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number
  limit?: number
  search?: string
} = {}): Promise<AvailableVehicleDTO[]> {
  const { data } = await httpClientInstance.get<{
    results: AvailableVehicleApiDTO[]
  }>("/admins/mvest/available-vehicles", {
    params: {
      page,
      limit,
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
  })
  return data.results.map((vehicle) => ({
    driverVehicleIdentifier: vehicle.driver_vehicle_identifier,
    plateNumber: vehicle.plate_number,
    vehicleMake: vehicle.vehicle_make,
    vehicleModel: vehicle.vehicle_model,
    driverFirstName: vehicle.driver_first_name,
    driverLastName: vehicle.driver_last_name,
  }))
}

export interface CreateAgreementPayload {
  ownerIdentifier: string
  driverVehicleIdentifier: string
  commissionPercentage: number
  startsAt: string
  endsAt: string | null
}

export async function createAgreement(
  payload: CreateAgreementPayload
): Promise<{ success: boolean; message: string; identifier?: string }> {
  try {
    const { data } = await httpClientInstance.post<{
      message?: string
      results?: { identifier?: string }
    }>("/admins/mvest/agreements", payload)
    revalidatePath("/mvest/agreements")
    return {
      success: true,
      message: data.message ?? "Agreement created successfully.",
      identifier: data.results?.identifier,
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not create agreement.",
      }
    }
    return { success: false, message: "Could not create agreement." }
  }
}

export async function suspendAgreement(
  identifier: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await httpClientInstance.patch<{ message?: string }>(
      `/admins/mvest/agreements/${identifier}`,
      { isActive: false }
    )
    revalidatePath("/mvest/agreements")
    return {
      success: true,
      message: data.message ?? "Agreement suspended successfully.",
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not suspend agreement.",
      }
    }
    return { success: false, message: "Could not suspend agreement." }
  }
}
