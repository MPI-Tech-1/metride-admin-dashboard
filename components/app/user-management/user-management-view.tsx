"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconPlus, IconSearch } from "@tabler/icons-react"

import type { AdminListItemDTO } from "@/actions/userManagement/listAdmins"
import { CreateAdminDialog } from "@/components/app/user-management/create-admin-dialog"
import { DeleteAdminDialog } from "@/components/app/user-management/delete-admin-dialog"
import { buildAdminColumns } from "@/components/app/user-management/admin-table-columns"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import type PaginationMeta from "@/types/pagination-meta"

interface UserManagementViewProps {
  admins: AdminListItemDTO[]
  paginationMeta: PaginationMeta
  searchQuery: string
  currentUserId: string | null
}

const SEARCH_DEBOUNCE_MS = 350

export function UserManagementView({
  admins,
  paginationMeta,
  searchQuery,
  currentUserId,
}: UserManagementViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [createOpen, setCreateOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<{
    identifier: string
    fullName: string
    email: string
  } | null>(null)
  const [isNavigating, startNavigation] = useTransition()

  // Keep input in sync if URL changes externally (e.g. browser back).
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const updateParams = useMemo(
    () =>
      (mutator: (next: URLSearchParams) => void) => {
        const next = new URLSearchParams(searchParams?.toString() ?? "")
        mutator(next)
        const queryString = next.toString()
        startNavigation(() => {
          router.replace(queryString ? `${pathname}?${queryString}` : pathname)
        })
      },
    [pathname, router, searchParams]
  )

  // Debounce typing → URL → server refetch.
  useEffect(() => {
    if (searchInput === searchQuery) return
    const handle = window.setTimeout(() => {
      updateParams((p) => {
        const trimmed = searchInput.trim()
        if (trimmed) p.set("searchQuery", trimmed)
        else p.delete("searchQuery")
        p.delete("page")
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [searchInput, searchQuery, updateParams])

  const columns = useMemo(
    () =>
      buildAdminColumns({
        currentUserId,
        onRequestDelete: (admin) =>
          setAdminToDelete({
            identifier: admin.identifier,
            fullName: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
          }),
      }),
    [currentUserId]
  )

  function handlePageChange(page: number) {
    updateParams((p) => {
      if (page <= 1) p.delete("page")
      else p.set("page", String(page))
    })
  }

  function handlePageSizeChange(limit: number) {
    updateParams((p) => {
      if (limit === 10) p.delete("limit")
      else p.set("limit", String(limit))
      p.delete("page")
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex flex-col gap-4 px-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add and remove admins, and assign the role that controls what
              they can see.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <IconSearch
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 w-full pl-9 sm:w-72"
                aria-label="Search admins"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <IconPlus size={14} />
              Add admin
            </Button>
          </div>
        </div>

        <div
          className={isNavigating ? "opacity-70 transition-opacity" : undefined}
          aria-busy={isNavigating}
        >
          <DataTable
            data={admins}
            columns={columns}
            paginationMeta={paginationMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      <CreateAdminDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteAdminDialog
        admin={adminToDelete}
        onClose={() => setAdminToDelete(null)}
      />
    </div>
  )
}
