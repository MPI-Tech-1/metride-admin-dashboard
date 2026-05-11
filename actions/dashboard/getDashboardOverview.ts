"use server"

import httpClientInstance from "@/actions/http-client"

export interface DashboardMetric {
  value: number
  currentPeriodValue: number | null
  previousPeriodValue: number | null
  changePercentVsPreviousPeriod: number | null
  trendBasis?: string
}

export interface DashboardOverview {
  generatedAt: string
  bookings: {
    total: DashboardMetric
    completed: DashboardMetric
    cancelled: DashboardMetric
    pendingAwaitingDriverAssignment: DashboardMetric
    inProgress: DashboardMetric
    comparisonNote: string
  }
  drivers: {
    total: DashboardMetric
    activeLast24Hours: DashboardMetric
    approved: DashboardMetric
    pendingApproval: DashboardMetric
    rejected: DashboardMetric
    comparisonNote: string
  }
  customers: {
    total: DashboardMetric
    activeLast30Days: DashboardMetric
    newThisCalendarMonth: DashboardMetric
    inactive90PlusDays: DashboardMetric
    comparisonNote: string
  }
}

interface GetDashboardOverviewResponse {
  status_code: number
  status: string
  message: string
  results: DashboardOverview
}

export default async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await httpClientInstance.get<GetDashboardOverviewResponse>(
    `/dashboard/overview`
  )
  return data.results
}
