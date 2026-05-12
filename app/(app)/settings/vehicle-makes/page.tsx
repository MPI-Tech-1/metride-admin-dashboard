export const dynamic = "force-dynamic"

import listVehicleMakes from "@/actions/settings/listVehicleMakes"
import { VehicleMakesSection } from "@/components/app/settings/vehicle-makes-section"
import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const makes = await listVehicleMakes()

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Vehicle makes", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Vehicle makes</h1>
            <p className="text-sm text-muted-foreground">
              Brands and manufacturers. Separate from ride types, which define
              service classes and pricing.
            </p>
          </div>
          <VehicleMakesSection makes={makes} />
        </div>
      </div>
    </AppLayout>
  )
}
