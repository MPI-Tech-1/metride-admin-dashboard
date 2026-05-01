import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import { SectionCards } from "@/components/app/driver/section-cards"
import { DriversTable } from "@/components/app/driver/driver-table"

export default function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Drivers",
      href: "#",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Drivers</h1>
              <p className="text-sm text-muted-foreground">
                Manage and view driver information and performance.
              </p>
            </div>
          </div>
          <SectionCards />
          <DriversTable />
        </div>
      </div>
    </AppLayout>
  )
}
