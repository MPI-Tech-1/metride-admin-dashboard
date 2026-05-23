/**
 * Role-based access control for the admin dashboard.
 *
 * The single source of truth for which routes a role can reach. Imported by
 * the middleware (server-side gate), the sidebar (client-side filter), and
 * page-level checks where needed.
 */

export const ROLES = ["admin", "operations", "finance"] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  operations: "Operations",
  finance: "Finance",
}

const ALL_ROLES: readonly Role[] = ROLES

/**
 * Each entry maps a path prefix to the roles allowed to access it.
 * Order matters — the first matching prefix wins, so list more specific
 * prefixes before broader ones.
 */
type RouteRule = { prefix: string; roles: readonly Role[] }

const ROUTE_RULES: RouteRule[] = [
  // All authenticated roles
  { prefix: "/dashboard", roles: ALL_ROLES },

  // Admin only
  { prefix: "/user-management", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },

  // Admin + Operations
  { prefix: "/customers", roles: ["admin", "operations"] },
  { prefix: "/customer", roles: ["admin", "operations"] },
  { prefix: "/drivers", roles: ["admin", "operations"] },
  { prefix: "/driver", roles: ["admin", "operations"] },
  { prefix: "/booking", roles: ["admin", "operations"] },
  { prefix: "/tracking", roles: ["admin", "operations"] },

  // Admin + Finance
  { prefix: "/wallet", roles: ["admin", "finance"] },
]

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
}

export function normalizeRole(value: unknown): Role | null {
  return isRole(value) ? value : null
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Returns the rule that governs a given pathname, or `null` if no rule applies
 * (in which case the route is treated as open to any authenticated user).
 */
function findRule(pathname: string): RouteRule | null {
  return (
    ROUTE_RULES.find((rule) => pathMatchesPrefix(pathname, rule.prefix)) ?? null
  )
}

export function isPathAllowedForRole(pathname: string, role: Role): boolean {
  const rule = findRule(pathname)
  if (!rule) return true
  return rule.roles.includes(role)
}

/**
 * The page a role should land on after login (or after being bounced from a
 * forbidden route). Dashboard is open to all roles, so it works as a safe
 * universal default.
 */
export function defaultLandingPath(_role: Role): string {
  return "/dashboard"
}
