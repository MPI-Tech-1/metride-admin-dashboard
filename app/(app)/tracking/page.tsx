export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { LiveTrackingMap } from "@/components/app/tracking/live-tracking-map"
import { getGoogleMapsClientConfig } from "@/lib/google-maps-client-config"
import { BreadcrumbItem } from "@/types/breadcrumb"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Live Tracking", href: "#" }]

export default async function Page() {
  const googleMaps = getGoogleMapsClientConfig()
  const websocketUrl = process.env.WEBSOCKET_BASE_URL ?? "https://api.metride.app"

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="-mx-4 -mb-4 flex flex-1 overflow-hidden">
        <LiveTrackingMap googleMaps={googleMaps} websocketUrl={websocketUrl} />
      </div>
    </AppLayout>
  )
}
