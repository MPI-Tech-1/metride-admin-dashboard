"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { MetRideLogoMark } from "@/components/brand/met-ride-logos"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function getPostLoginPath() {
    const callbackUrl = searchParams.get("callbackUrl")

    if (!callbackUrl || callbackUrl === "/" || callbackUrl === "/login") {
      return "/dashboard"
    }

    try {
      const parsed = new URL(callbackUrl, window.location.origin)
      const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`
      if (!normalizedPath || normalizedPath === "/" || normalizedPath === "/login") {
        return "/dashboard"
      }
      return normalizedPath
    } catch {
      return "/dashboard"
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setIsLoading(false)
      toast.error(
        result.error === "CredentialsSignin"
          ? "Invalid login credentials."
          : result.error
      )
      return
    }

    toast.success("Authentication successful.")
    // Hard navigation so middleware sees the freshly-set auth cookie on the
    // next request. `router.push` occasionally races with the cookie write
    // and bounces back to /login.
    window.location.assign(getPostLoginPath())
  }

  return (
    <form
      className={cn("flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-7", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="relative mb-1 size-16 shrink-0 overflow-hidden rounded-2xl bg-muted/50 ring-1 ring-border/60 lg:hidden">
            <MetRideLogoMark fill priority />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in to manage bookings, drivers, and customer activity.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email" className="text-sm font-medium">
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@metride.com"
              className="h-12 pl-11 text-base md:text-base"
              autoComplete="email"
              required
            />
          </div>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" className="text-sm font-medium">
              Password
            </FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="h-12 pl-11 pr-12 text-base md:text-base"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full text-base font-medium"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
