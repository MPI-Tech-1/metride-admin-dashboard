export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { PopularLocationsSection } from "@/components/app/settings/popular-locations-section"
import listCities from "@/actions/settings/listCities"
import listPopularLocations from "@/actions/settings/listPopularLocations"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const [locations, cities] = await Promise.all([
    listPopularLocations(),
    listCities(),
  ])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Popular routes", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Popular routes</h1>
            <p className="text-sm text-muted-foreground">
              Popular pickup and drop-off locations per city, shown during
              booking.
            </p>
          </div>
          <PopularLocationsSection locations={locations} cities={cities} />
        </div>
      </div>
    </AppLayout>
  )
}
