export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { CitiesSection } from "@/components/app/settings/cities-section"
import listCities from "@/actions/settings/listCities"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const cities = await listCities()

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Settings", href: "#" },
    { title: "Cities", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Cities</h1>
            <p className="text-sm text-muted-foreground">
              Create and update cities with coordinates for your service areas.
            </p>
          </div>
          <CitiesSection cities={cities} />
        </div>
      </div>
    </AppLayout>
  )
}
