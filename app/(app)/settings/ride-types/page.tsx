export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { RideTypesSection } from "@/components/app/settings/ride-types-section"
import listRideTypes from "@/actions/settings/listRideTypes"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const rideTypes = await listRideTypes()

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Ride types", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Ride types</h1>
            <p className="text-sm text-muted-foreground">
              Configure vehicle classes and pricing. Amounts are stored in kobo
              and displayed in naira.
            </p>
          </div>
          <RideTypesSection rideTypes={rideTypes} />
        </div>
      </div>
    </AppLayout>
  )
}
