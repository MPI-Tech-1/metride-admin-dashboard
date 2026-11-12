import type { Metadata } from "next"
import { Geist_Mono, Nunito } from "next/font/google"
import { getServerSession } from "next-auth/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { authOptions } from "@/lib/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "Met Ride Admin",
    template: "%s · Met Ride Admin",
  },
  description: "Met Ride operations and admin dashboard.",
}

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Seed the client session with the server one so session-dependent UI (the
  // role-filtered sidebar) renders identically on server and client. Without
  // this, streamed pages hydrate after the client has fetched the session,
  // the trees differ, and Radix's useId values mismatch.
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", nunito.variable)}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Providers session={session}>{children}</Providers>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
