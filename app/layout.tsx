import type { Metadata } from "next"
import { Geist_Mono, Nunito } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Met Ride Admin",
    template: "%s · Met Ride Admin",
  },
  description: "Met Ride operations and admin dashboard.",
  icons: {
    icon: [{ url: "/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/logo-mark.png", sizes: "180x180" }],
  },
}

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", nunito.variable)}
    >
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
