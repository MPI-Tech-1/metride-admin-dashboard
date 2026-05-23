"use server"

import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"

export type UploadImageResult =
  | { success: true; url: string; message: string }
  | { success: false; message: string }

interface UploadImageApiResponse {
  status_code: number
  status: string
  message: string
  results: { url: string }
}

/**
 * Uploads a single image to the platform's media endpoint and returns its
 * public URL. The auth token is read on the server so the upload never
 * exposes credentials to the browser.
 */
export default async function uploadImage(
  formData: FormData
): Promise<UploadImageResult> {
  const file = formData.get("image")

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Pick an image to upload." }
  }

  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return { success: false, message: "API base URL is not configured." }
  }

  const session = await getServerSession(authOptions)
  const token = session?.user?.accessToken

  const apiBody = new FormData()
  apiBody.append("image", file, file.name)

  let response: Response
  try {
    response = await fetch(`${baseUrl}/common/media/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: apiBody,
    })
  } catch (networkError) {
    console.error("uploadImage network error", networkError)
    return { success: false, message: "Network error. Try again." }
  }

  let payload: UploadImageApiResponse | null = null
  try {
    payload = (await response.json()) as UploadImageApiResponse
  } catch {
    payload = null
  }

  if (!response.ok || !payload) {
    return {
      success: false,
      message: payload?.message ?? "Image upload failed.",
    }
  }

  return {
    success: true,
    url: payload.results.url,
    message: payload.message,
  }
}
