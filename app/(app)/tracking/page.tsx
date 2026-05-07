import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { LiveTrackingMap } from "@/components/app/tracking/live-tracking-map"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Live Tracking", href: "#" }]

export default function Page() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="-mx-4 -mb-4 flex flex-1 overflow-hidden">
        <LiveTrackingMap />
      </div>
    </AppLayout>
  )
}
