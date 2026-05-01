"use client"

import { DataTable } from "@/components/ui/data-table"
import { Driver, driverColumns } from "./driver-table-column"

const data: Driver[] = [
  {
    id: 1,
    name: "James Okafor",
    status: "Active",
    trips: 312,
    rating: 4.8,
    acceptanceRate: "94%",
    cancellationRate: "3.1%",
    earnings: "$19.20",
  },
  {
    id: 2,
    name: "Amina Bello",
    status: "Active",
    trips: 205,
    rating: 4.6,
    acceptanceRate: "89%",
    cancellationRate: "5.4%",
    earnings: "$17.80",
  },
  {
    id: 3,
    name: "Chukwudi Eze",
    status: "Suspended",
    trips: 98,
    rating: 3.9,
    acceptanceRate: "72%",
    cancellationRate: "14.2%",
    earnings: "$15.00",
  },
]

export function DriversTable() {
  return <DataTable data={data} columns={driverColumns} />
}
