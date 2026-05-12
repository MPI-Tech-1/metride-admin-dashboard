import { Suspense } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { LoginForm } from "@/components/authentication/login/login-form"
import { MetRideLogoSquare } from "@/components/brand/met-ride-logos"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-gradient-to-br from-background via-muted/30 to-primary/[0.06] lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-semibold tracking-tight"
          >
            <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border">
              <MetRideLogoSquare fill priority />
            </span>
            <span className="text-lg">Met Ride Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-muted/40 p-10 lg:flex lg:items-center">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/[0.12] blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-background/95 shadow-md ring-1 ring-border/70 backdrop-blur">
            <MetRideLogoSquare fill priority />
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5" />
            Admin operations center
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Run your transport platform from one dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor bookings in real time, manage drivers, and process payouts
            with secure admin access.
          </p>
        </div>
      </div>
    </div>
  )
}
