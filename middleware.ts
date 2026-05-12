import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
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
