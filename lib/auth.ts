import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import HttpClient from "@/lib/http-client"
import { normalizeRole, type Role } from "@/lib/permissions"
import axios from "axios"

interface AuthApiResponse {
  status_code: number
  status: string
  message: string
  results: {
    identifier: string
    firstName: string
    lastName: string
    email: string
    role: string
    accessCredentials: {
      type: string
      token: string
      abilities: string[]
      expiresAt: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { apiResponse } = await HttpClient.post({
            endpointUrl: `${process.env.API_BASE_URL}/admins/authentication/authenticate`,
            dataPayload: {
              email: credentials?.email,
              password: credentials?.password,
            },
            headerOptions: {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            },
          })

          const response = apiResponse as AuthApiResponse

          const role = normalizeRole(response.results.role)
          if (!role) {
            throw new Error("Your account does not have a valid role assigned.")
          }

          return {
            id: response.results.identifier,
            name: `${response.results.firstName} ${response.results.lastName}`,
            email: response.results.email,
            accessToken: response.results.accessCredentials.token,
            role,
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(
              error.response.data?.message ?? "Authentication failed."
            )
          }
          throw new Error("Authentication failed.")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as { accessToken: string; role: Role }
        token.accessToken = typedUser.accessToken
        token.id = user.id as string
        token.role = typedUser.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
