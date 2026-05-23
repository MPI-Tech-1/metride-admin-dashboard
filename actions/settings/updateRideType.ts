"use server"

import axios from "axios"
import httpClientInstance from "@/actions/http-client"
import { revalidatePath } from "next/cache"

export interface UpdateRideTypeBody {
  identifier: string
  name: string
  description: string
  numberOfSeats: number
  pricePerKilometer: number
  basePrice: number
  minimumPrice: number
  isActive: boolean
}

interface UpdateRideTypeArgs {
  identifier: string
  body: UpdateRideTypeBody
}

type UpdateRideTypeInput =
  | UpdateRideTypeArgs
  | [identifier: string, body: UpdateRideTypeBody]
  | string

interface UpdateRideTypeResponse {
  message: string
}

function normalizeUpdateRideTypeInput(
  input: UpdateRideTypeInput,
  body?: UpdateRideTypeBody
): UpdateRideTypeArgs | null {
  if (typeof input === "string") {
    if (!body) {
      return null
    }
    return { identifier: input, body }
  }

  if (Array.isArray(input)) {
    const [identifier, nextBody] = input
    if (!identifier || !nextBody) {
      return null
    }
    return { identifier, body: nextBody }
  }

  if (!input.identifier || !input.body) {
    return null
  }

  return input
}

export default async function updateRideType(
  input: UpdateRideTypeInput,
  body?: UpdateRideTypeBody
): Promise<{ success: boolean; message: string }> {
  const normalized = normalizeUpdateRideTypeInput(input, body)

  if (!normalized) {
    return { success: false, message: "Could not update ride type." }
  }

  const { identifier, body: payload } = normalized

  try {
    const { data } = await httpClientInstance.patch<UpdateRideTypeResponse>(
      `/admins/settings/booking/ride-types/${identifier}`,
      payload
    )
    revalidatePath("/settings/ride-types")
    return { success: true, message: data.message }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message ?? "Could not update ride type.",
      }
    }
    return { success: false, message: "Could not update ride type." }
  }
}
