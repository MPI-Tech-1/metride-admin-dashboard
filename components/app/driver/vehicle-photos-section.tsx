"use client"

import { useState, useTransition } from "react"
import { IconCamera, IconPhotoOff } from "@tabler/icons-react"
import { toast } from "sonner"

import addDriverVehiclePhoto from "@/actions/vehicles/addDriverVehiclePhoto"
import type {
  VehiclePhotoDTO,
  VehiclePhotoSection,
} from "@/actions/vehicles/listDriverVehiclePhotos"
import { UploadImageButton } from "@/components/app/common/upload-image-button"
import { cn } from "@/lib/utils"

const SECTIONS: { key: VehiclePhotoSection; title: string }[] = [
  { key: "front", title: "Front" },
  { key: "side", title: "Side" },
  { key: "back", title: "Back" },
  { key: "interior", title: "Interior" },
]

interface VehiclePhotosSectionProps {
  driverId: string
  initialPhotos: VehiclePhotoDTO[]
}

export function VehiclePhotosSection({
  driverId,
  initialPhotos,
}: VehiclePhotosSectionProps) {
  const [photos, setPhotos] = useState<VehiclePhotoDTO[]>(initialPhotos)
  const [isPending, startTransition] = useTransition()
  const [pendingSection, setPendingSection] =
    useState<VehiclePhotoSection | null>(null)

  function handleUploaded(section: VehiclePhotoSection, photoUrl: string) {
    setPendingSection(section)
    startTransition(async () => {
      const result = await addDriverVehiclePhoto({
        driverIdentifier: driverId,
        section,
        photoUrl,
      })

      if (!result.success || !result.photo) {
        toast.error(result.message)
        setPendingSection(null)
        return
      }

      toast.success(result.message)
      setPhotos((prev) => [result.photo!, ...prev])
      setPendingSection(null)
    })
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold sm:text-lg">Vehicle photos</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Upload front, side, back, and interior photos of the driver&apos;s
            vehicle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ key, title }) => {
          const sectionPhotos = photos.filter((p) => p.section === key)
          const latest = sectionPhotos[0]
          const isUploadingThis = isPending && pendingSection === key

          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border bg-card/40 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{title}</p>
                <span className="text-xs text-muted-foreground">
                  {sectionPhotos.length}
                </span>
              </div>

              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted",
                  isUploadingThis && "opacity-60"
                )}
              >
                {latest ? (
                  <a
                    href={latest.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={latest.photoUrl}
                      alt={`${title} vehicle photo`}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </a>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconPhotoOff size={28} stroke={1.5} />
                    <span className="text-xs">No photo</span>
                  </div>
                )}
              </div>

              <UploadImageButton
                onUploaded={(url) => handleUploaded(key, url)}
                disabled={isPending}
                size="sm"
                className="w-full"
                label={latest ? "Replace photo" : "Add photo"}
                uploadingLabel="Uploading…"
                hideIcon={false}
              />

              {sectionPhotos.length > 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sectionPhotos.slice(1, 6).map((photo) => (
                    <a
                      key={photo.identifier}
                      href={photo.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 overflow-hidden rounded-md border bg-muted ring-offset-2 transition hover:ring-2 hover:ring-primary/30"
                      title={`Earlier ${title.toLowerCase()} photo`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.photoUrl}
                        alt={`Earlier ${title.toLowerCase()} photo`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                  {sectionPhotos.length > 6 && (
                    <span className="flex size-8 items-center justify-center rounded-md border bg-muted text-[10px] font-medium text-muted-foreground">
                      +{sectionPhotos.length - 6}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {photos.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <IconCamera size={14} />
          No vehicle photos yet — upload one for each section.
        </p>
      )}
    </div>
  )
}
