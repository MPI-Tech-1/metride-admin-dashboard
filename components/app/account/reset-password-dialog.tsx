"use client"

import { useEffect, useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { Eye, EyeOff, Loader2, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import requestPasswordReset from "@/actions/auth/requestPasswordReset"
import resetPassword from "@/actions/auth/resetPassword"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

type Step = "request" | "verify"

const OTP_LENGTH = 6
const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordDialog({
  open,
  onOpenChange,
  email,
}: ResetPasswordDialogProps) {
  const [step, setStep] = useState<Step>("request")
  const [otpToken, setOtpToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isRequesting, startRequest] = useTransition()
  const [isSubmitting, startSubmit] = useTransition()
  const isBusy = isRequesting || isSubmitting

  // Reset state whenever the dialog closes so the next open is clean.
  useEffect(() => {
    if (!open) {
      setStep("request")
      setOtpToken("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPassword(false)
    }
  }, [open])

  function handleRequestOtp({ resend }: { resend: boolean } = { resend: false }) {
    if (!email) {
      toast.error("Your account is missing an email — contact support.")
      return
    }
    startRequest(async () => {
      const result = await requestPasswordReset(email)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setStep("verify")
      if (resend) setOtpToken("")
    })
  }

  const passwordsMatch = newPassword === confirmPassword
  const trimmedOtp = otpToken.trim()
  const isVerifyValid =
    trimmedOtp.length === OTP_LENGTH &&
    /^\d+$/.test(trimmedOtp) &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch

  function handleVerify() {
    if (!isVerifyValid) {
      if (trimmedOtp.length !== OTP_LENGTH) {
        toast.error(`OTP must be ${OTP_LENGTH} digits.`)
      } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
        toast.error(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        )
      } else if (!passwordsMatch) {
        toast.error("Passwords don't match.")
      }
      return
    }

    startSubmit(async () => {
      const result = await resetPassword({
        email,
        otpToken: trimmedOtp,
        newPassword,
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(`${result.message} Please sign in again.`)
      onOpenChange(false)
      // Defer just enough for the toast to render before tearing down the
      // session and redirecting to /login.
      window.setTimeout(() => {
        signOut({ callbackUrl: "/login" })
      }, 300)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isBusy) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Reset password
          </DialogTitle>
          <DialogDescription>
            {step === "request"
              ? "We'll email a one-time code to verify it's really you. Then you can set a new password."
              : "Enter the code we just emailed you and choose a new password."}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <RequestStep email={email} isRequesting={isRequesting} />
        ) : (
          <VerifyStep
            email={email}
            otpToken={otpToken}
            onOtpChange={setOtpToken}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((v) => !v)}
            disabled={isBusy}
            onResend={() => handleRequestOtp({ resend: true })}
            isRequesting={isRequesting}
          />
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          {step === "request" ? (
            <Button
              type="button"
              onClick={() => handleRequestOtp()}
              disabled={isRequesting || !email}
            >
              {isRequesting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Send code
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleVerify}
              disabled={isBusy || !isVerifyValid}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Reset password
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RequestStep({
  email,
  isRequesting,
}: {
  email: string
  isRequesting: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Mail className="size-4 text-muted-foreground" />
          {email || "(no email on file)"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The reset code will arrive at this address. After resetting,
          you&apos;ll be signed out and need to log in with the new password.
        </p>
      </div>
      {isRequesting ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Sending code…
        </p>
      ) : null}
    </div>
  )
}

function VerifyStep({
  email,
  otpToken,
  onOtpChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showPassword,
  onToggleShowPassword,
  disabled,
  onResend,
  isRequesting,
}: {
  email: string
  otpToken: string
  onOtpChange: (v: string) => void
  newPassword: string
  onNewPasswordChange: (v: string) => void
  confirmPassword: string
  onConfirmPasswordChange: (v: string) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  disabled: boolean
  onResend: () => void
  isRequesting: boolean
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Code sent to{" "}
        <span className="font-medium text-foreground">{email}</span>.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="otp">Verification code</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder="123456"
          value={otpToken}
          onChange={(e) =>
            onOtpChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
          disabled={disabled}
          className="h-10 font-mono text-base tracking-[0.4em] tabular-nums"
          autoFocus
        />
        <button
          type="button"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
          onClick={onResend}
          disabled={disabled}
        >
          {isRequesting ? "Resending…" : "Resend code"}
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            disabled={disabled}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Type the new password again"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          disabled={disabled}
          className="h-10"
        />
        {confirmPassword.length > 0 && newPassword !== confirmPassword ? (
          <p className="text-[11px] text-destructive">
            Passwords don&apos;t match.
          </p>
        ) : null}
      </div>
    </div>
  )
}
