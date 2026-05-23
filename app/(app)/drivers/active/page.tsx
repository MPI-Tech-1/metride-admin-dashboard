export const dynamic = "force-dynamic"

import listActiveDrivers from "@/actions/drivers/listActiveDrivers"
import { ActiveDriversView } from "@/components/app/drivers/active-drivers-view"
import AppLayout from "@/components/layouts/app-layout"
import { getGoogleMapsClientConfig } from "@/lib/google-maps-client-config"
import { BreadcrumbItem } from "@/types/breadcrumb"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Drivers", href: "/driver" },
  { title: "Active drivers", href: "#" },
]

export default async function Page() {
  const googleMaps = getGoogleMapsClientConfig()
  const initialActiveDrivers = await listActiveDrivers().catch(() => ({
    drivers: [],
    paginationMeta: null,
  }))

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="-mx-4 -mb-4 flex flex-1 overflow-hidden">
        <ActiveDriversView
          googleMaps={googleMaps}
          initialDrivers={initialActiveDrivers.drivers}
        />
      </div>
    </AppLayout>
  )
}
