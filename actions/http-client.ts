import { authOptions } from "@/lib/auth"
import axios, { AxiosRequestConfig } from "axios"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

const httpClientInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Frame-Options": "SAMEORIGIN",
    "Access-Control-Allow-Methods": "PATCH, POST, PUT, GET, OPTIONS, DELETE",
    "Access-Control-Request-Method": "PATCH, POST, PUT, GET, OPTIONS, DELETE",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; object-src 'none'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  },
})

httpClientInstance.interceptors.request.use(async (config) => {
  if (config.headers?.Authorization) {
    return config
  }
  try {
    const session = await getServerSession(authOptions)
    const token = session?.user?.accessToken
    if (token) {
      ;(config.headers as AxiosRequestConfig["headers"]) = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  } catch {}
  return config
})

httpClientInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/login")
    }
    return Promise.reject(error)
  }
)

export default httpClientInstance
