export const dynamic = "force-dynamic"

import listVehicleMakes from "@/actions/settings/listVehicleMakes"
import listVehicleModels from "@/actions/settings/listVehicleModels"
import { VehicleModelsSection } from "@/components/app/settings/vehicle-models-section"
import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const [makes, models] = await Promise.all([
    listVehicleMakes(),
    listVehicleModels(),
  ])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Vehicle models", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Vehicle models</h1>
            <p className="text-sm text-muted-foreground">
              Model names under each make. Ride types (service tiers) are
              configured separately.
            </p>
          </div>
          <VehicleModelsSection makes={makes} models={models} />
        </div>
      </div>
    </AppLayout>
  )
}
