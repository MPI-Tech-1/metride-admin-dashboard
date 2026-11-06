import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS, type Role } from "@/lib/permissions"
import { cn } from "@/lib/utils"

const roleStyles: Record<Role, string> = {
  admin:
    "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-200",
  operations:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-200",
  finance:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200",
}

export function RoleBadge({
  role,
  className,
}: {
  role: Role
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[11px] font-medium uppercase tracking-wide",
        roleStyles[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </Badge>
  )
}
