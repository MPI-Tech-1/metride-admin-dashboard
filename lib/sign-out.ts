"use client"

import { signOut } from "next-auth/react"

/**
 * Ends the session and sends the user to /login on the *current* origin.
 *
 * We deliberately avoid `signOut({ callbackUrl })`: next-auth resolves that
 * redirect against NEXTAUTH_URL on the server, so a misconfigured value (e.g.
 * http://localhost:3000 baked into a production image) sends users to the
 * wrong host after logging out.
 */
export async function signOutToLogin(reason?: "signed-out" | "password-reset") {
  try {
    await signOut({ redirect: false })
  } finally {
    const query = reason ? `?reason=${reason}` : ""
    window.location.assign(`/login${query}`)
  }
}
