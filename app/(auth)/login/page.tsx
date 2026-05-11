import { Suspense } from "react"
import { GalleryVerticalEnd, ShieldCheck, Sparkles } from "lucide-react"

import { LoginForm } from "@/components/authentication/login/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-gradient-to-br from-background via-background to-primary/5 lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Met Ride Admin
          </a>
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
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
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
          <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-4 backdrop-blur">
            <ShieldCheck className="mt-0.5 size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Protected by role-based authentication and secure API tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
