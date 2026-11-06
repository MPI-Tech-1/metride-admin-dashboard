"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { IconDotsVertical, IconShieldCheck, IconTrash } from "@tabler/icons-react"

import type { AdminListItemDTO } from "@/actions/userManagement/listAdmins"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROLE_LABELS, type Role } from "@/lib/permissions"
import { cn } from "@/lib/utils"

export interface AdminColumnContext {
  currentUserId: string | null
  onRequestDelete: (admin: AdminListItemDTO) => void
}

const roleBadgeStyles: Record<Role, string> = {
  admin:
    "border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/60 dark:text-violet-200",
  operations:
    "border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-800/80 dark:bg-blue-950/60 dark:text-blue-200",
  finance:
    "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-200",
}

export function buildAdminColumns(
  ctx: AdminColumnContext
): ColumnDef<AdminListItemDTO>[] {
  return [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const isMe = ctx.currentUserId === row.original.identifier
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </span>
            {isMe ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                You
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 px-2.5 py-0.5 text-xs font-medium",
              roleBadgeStyles[role]
            )}
          >
            <IconShieldCheck size={12} />
            {ROLE_LABELS[role]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {format(new Date(row.original.createdAt), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const admin = row.original
        const isMe = ctx.currentUserId === admin.identifier

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                  aria-label={`Open actions for ${admin.firstName} ${admin.lastName}`}
                >
                  <IconDotsVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isMe}
                  onSelect={(event) => {
                    event.preventDefault()
                    if (!isMe) ctx.onRequestDelete(admin)
                  }}
                >
                  <IconTrash size={14} />
                  {isMe ? "Can't delete self" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
