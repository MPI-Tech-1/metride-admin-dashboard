export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"

import listAdmins from "@/actions/userManagement/listAdmins"
import { UserManagementView } from "@/components/app/user-management/user-management-view"
import AppLayout from "@/components/layouts/app-layout"
import { authOptions } from "@/lib/auth"
import { BreadcrumbItem } from "@/types/breadcrumb"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "User management", href: "#" },
]

const DEFAULT_LIMIT = 10

function parsePositiveInt(
  value: string | string[] | undefined,
  fallback: number
): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

function parseSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return (raw ?? "").trim()
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[]
    limit?: string | string[]
    searchQuery?: string | string[]
  }>
}) {
  const session = await getServerSession(authOptions)
  const params = await searchParams

  const page = parsePositiveInt(params.page, 1)
  const limit = parsePositiveInt(params.limit, DEFAULT_LIMIT)
  const searchQuery = parseSearchQuery(params.searchQuery)

  const { admins, paginationMeta } = await listAdmins({
    page,
    limit,
    searchQuery: searchQuery || undefined,
  }).catch(() => ({
    admins: [],
    paginationMeta: {
      total: 0,
      perPage: limit,
      currentPage: page,
      lastPage: 1,
      firstPage: 1,
      firstPageUrl: "/?page=1",
      lastPageUrl: "/?page=1",
      nextPageUrl: null,
      previousPageUrl: null,
    },
  }))

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <UserManagementView
        admins={admins}
        paginationMeta={paginationMeta}
        searchQuery={searchQuery}
        currentUserId={session?.user?.id ?? null}
      />
    </AppLayout>
  )
}
