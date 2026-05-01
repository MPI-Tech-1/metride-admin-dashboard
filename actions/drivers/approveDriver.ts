"use server"

import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export default async function approveDriver(driverId: string) {
  try {
    await httpClientInstance.post(
      `driver-management/drivers/${driverId}/approve`
    )

    revalidatePath(`/driver/${driverId}`)
  } catch (approveDriverError) {
    console.log("approveDriverError => ", approveDriverError)
    throw approveDriverError
  }
}
