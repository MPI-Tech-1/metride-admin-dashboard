export const dynamic = "force-dynamic"

import AppLayout from "@/components/layouts/app-layout"
import { InvestorVehiclesSection } from "@/components/app/mvest/investor-vehicles-section"
import listInvestorVehicles from "@/actions/mvest/listInvestorVehicles"
import listInvestors from "@/actions/mvest/listInvestors"
import listRideTypes from "@/actions/settings/listRideTypes"
import listVehicleMakes from "@/actions/settings/listVehicleMakes"
import listVehicleModels from "@/actions/settings/listVehicleModels"
import type { BreadcrumbItem } from "@/types/breadcrumb"

export default async function Page() {
  const [
    { investorVehicles },
    { investors },
    rideTypes,
    makes,
    models,
  ] = await Promise.all([
    listInvestorVehicles(),
    listInvestors(),
    listRideTypes(),
    listVehicleMakes(),
    listVehicleModels(),
  ])

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Mvest", href: "#" },
    { title: "Investor Vehicles", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold">Investor Vehicles</h1>
            <p className="text-sm text-muted-foreground">
              Vehicles staked by Mvest investors and their ride share percentages.
            </p>
          </div>
          <InvestorVehiclesSection
            investorVehicles={investorVehicles}
            investors={investors}
            rideTypes={rideTypes}
            makes={makes}
            models={models}
          />
        </div>
      </div>
    </AppLayout>
  )
}
