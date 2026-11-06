import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  defaultLandingPath,
  isPathAllowedForRole,
  normalizeRole,
} from "@/lib/permissions"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = normalizeRole(token.role)
  if (!role) {
    // Token without a recognised role — force re-authentication.
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const pathname = request.nextUrl.pathname
  if (!isPathAllowedForRole(pathname, role)) {
    const fallback = new URL(defaultLandingPath(role), request.url)
    return NextResponse.redirect(fallback)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Skip auth for login, APIs, Next internals, favicon, and static assets in
     * /public (e.g. logos) — otherwise /logo-*.png redirects to HTML and next/image breaks.
     */
    "/((?!login|payment-success|api|_next/static|_next/image|favicon\\.ico|logo-mark\\.png|logo-square\\.png).*)",
  ],
}
