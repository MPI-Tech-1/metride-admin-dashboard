"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
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
  const [error, setError] = useState<string | null>(null)
  const [capsLockOn, setCapsLockOn] = useState(false)

  const reason = searchParams.get("reason")
  const notice =
    reason === "signed-out"
      ? "You've been logged out."
      : reason === "password-reset"
        ? "Password updated. Sign in with your new password."
        : searchParams.get("callbackUrl")
          ? "Please sign in to continue."
          : null

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
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string).trim()
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setIsLoading(false)
      setError(
        result.error === "CredentialsSignin"
          ? "Incorrect email or password."
          : result.error
      )
      return
    }

    toast.success("Signed in successfully.")
    // Hard navigation so middleware sees the freshly-set auth cookie on the
    // next request. `router.push` occasionally races with the cookie write
    // and bounces back to /login.
    window.location.assign(getPostLoginPath())
  }

  function handleCapsLock(e: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(e.getModifierState?.("CapsLock") ?? false)
  }

  return (
    <form
      className={cn(
        "flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8",
        className
      )}
      onSubmit={handleSubmit}
      onChange={() => error && setError(null)}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Sign in to manage bookings, drivers, and customer activity.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : notice ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border bg-muted/50 px-3.5 py-3 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{notice}</span>
        </div>
      ) : null}

      <fieldset disabled={isLoading} className="contents">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="email" className="text-sm font-medium">
              Email address
            </FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="admin@metride.com"
                className="h-11 pl-10 text-base md:text-sm"
                autoComplete="username"
                autoFocus
                aria-invalid={!!error}
                required
              />
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-sm font-medium">
              Password
            </FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-11 pl-10 pr-11 text-base md:text-sm"
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={capsLockOn ? "caps-lock-hint" : undefined}
                onKeyDown={handleCapsLock}
                onKeyUp={handleCapsLock}
                onBlur={() => setCapsLockOn(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" />
                ) : (
                  <Eye className="size-[18px]" />
                )}
              </button>
            </div>
            {capsLockOn && (
              <p id="caps-lock-hint" className="text-xs text-amber-600 dark:text-amber-500">
                Caps Lock is on.
              </p>
            )}
          </Field>
          <Button
            type="submit"
            className="h-11 w-full text-sm font-semibold"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </fieldset>

      <p className="text-center text-xs text-muted-foreground">
        Forgot your password? Contact a super admin to reset access.
      </p>
    </form>
  )
}
