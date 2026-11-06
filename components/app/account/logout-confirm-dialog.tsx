"use client"

import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signOutToLogin } from "@/lib/sign-out"

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
}: LogoutConfirmDialogProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleConfirm() {
    setIsSigningOut(true)
    await signOutToLogin("signed-out")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSigningOut) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut className="size-5" />
          </div>
          <DialogTitle>Log out of Met Ride Admin?</DialogTitle>
          <DialogDescription>
            You&apos;ll need to sign in again to access the dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSigningOut}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSigningOut}
          >
            {isSigningOut && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSigningOut ? "Logging out..." : "Log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
