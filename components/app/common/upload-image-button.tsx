"use client"

import * as React from "react"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

import uploadImage from "@/actions/common/uploadImage"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEFAULT_ACCEPT = "image/*"
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024 // 8 MB

type UploadImageButtonProps = {
  /** Called once the image is uploaded; receives the public URL. */
  onUploaded: (url: string) => void | Promise<void>
  /** Disabled across the upload flow. */
  disabled?: boolean
  label?: string
  uploadingLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  accept?: string
  maxBytes?: number
  /** Hide the leading icon. */
  hideIcon?: boolean
}

/**
 * Picks a single image, uploads it via the `uploadImage` server action,
 * then forwards the resulting public URL to the parent.
 */
export function UploadImageButton({
  onUploaded,
  disabled,
  label = "Upload image",
  uploadingLabel = "Uploading…",
  variant = "outline",
  size,
  className,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  hideIcon,
}: UploadImageButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const isBusy = isUploading || disabled

  function openPicker() {
    if (isBusy) return
    inputRef.current?.click()
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (file.size > maxBytes) {
      toast.error(
        `Image is too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`
      )
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const result = await uploadImage(formData)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      await onUploaded(result.url)
    } catch (uploadError) {
      console.error("UploadImageButton error", uploadError)
      toast.error("Image upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isBusy}
        onClick={openPicker}
        className={cn(className)}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          !hideIcon && <Upload className="size-4" />
        )}
        {isUploading ? uploadingLabel : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
