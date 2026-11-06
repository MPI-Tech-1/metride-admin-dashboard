import "next-auth"
import "next-auth/jwt"
import type { Role } from "@/lib/permissions"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      accessToken: string
      role: Role
    }
  }

  interface User {
    accessToken: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken: string
    role: Role
  }
}
