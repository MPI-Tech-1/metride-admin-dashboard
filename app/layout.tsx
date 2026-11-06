import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
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
