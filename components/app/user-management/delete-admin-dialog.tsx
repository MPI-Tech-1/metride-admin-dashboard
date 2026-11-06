"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import deleteAdmin from "@/actions/userManagement/deleteAdmin"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteAdminDialogProps {
  admin: { identifier: string; fullName: string; email: string } | null
  onClose: () => void
}

export function DeleteAdminDialog({ admin, onClose }: DeleteAdminDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!admin) return
    startTransition(async () => {
      const result = await deleteAdmin(admin.identifier)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onClose()
    })
  }

  return (
    <Dialog
      open={!!admin}
      onOpenChange={(next) => {
        if (!next && isPending) return
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete admin?</DialogTitle>
          <DialogDescription>
            {admin ? (
              <>
                <span className="font-medium text-foreground">
                  {admin.fullName}
                </span>{" "}
                ({admin.email}) will lose access immediately. This action
                can&apos;t be undone.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
