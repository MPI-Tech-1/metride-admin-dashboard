"use client"

import { useState, useTransition } from "react"
import { IconExternalLink, IconFileDescription } from "@tabler/icons-react"
import { toast } from "sonner"

import updateDriverReferenceForm from "@/actions/drivers/updateDriverReferenceForm"
import { UploadImageButton } from "@/components/app/common/upload-image-button"

interface ReferenceFormCardProps {
  driverId: string
  initialUrl: string | null
}

export function ReferenceFormCard({
  driverId,
  initialUrl,
}: ReferenceFormCardProps) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [isPending, startTransition] = useTransition()

  function handleUploaded(newUrl: string) {
    startTransition(async () => {
      const result = await updateDriverReferenceForm({
        driverId,
        referenceFormUrl: newUrl,
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setUrl(result.referenceFormUrl ?? newUrl)
    })
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold sm:text-lg">Reference form</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Signed reference form provided during onboarding.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Driver reference form"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </a>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <IconFileDescription size={32} stroke={1.5} />
              <span className="text-xs">No reference form yet</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UploadImageButton
            onUploaded={handleUploaded}
            disabled={isPending}
            size="sm"
            label={url ? "Replace reference form" : "Upload reference form"}
            uploadingLabel={isPending ? "Saving…" : "Uploading…"}
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Open file
              <IconExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
