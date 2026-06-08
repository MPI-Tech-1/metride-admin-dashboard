"use client"

import { useMemo } from "react"
import {
  Users,
  CarFront,
  CalendarCheck,
  LayoutDashboard,
  Wallet,
  RadioTower,
  Activity,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { MetRideLogoMark } from "@/components/brand/met-ride-logos"
import { NavMain, type NavSection, type NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { isPathAllowedForRole, normalizeRole, type Role } from "@/lib/permissions"
import Link from "next/link"

type RoleAwareNavItem = NavItem & {
  items?: (NavItem["items"] extends infer U
    ? U extends Array<infer I>
      ? I
      : never
    : never)[]
}

type RoleAwareNavSection = {
  label: string
  items: RoleAwareNavItem[]
}

const navSections: RoleAwareNavSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Drivers", url: "/driver", icon: CarFront },
      { title: "Active Drivers", url: "/drivers/active", icon: Activity },
      { title: "Bookings", url: "/booking", icon: CalendarCheck },
      { title: "Live Tracking", url: "/tracking", icon: RadioTower },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Wallet",
        url: "#",
        icon: Wallet,
        items: [
          { title: "Payout", url: "/wallet/payouts" },
          { title: "Driver", url: "/wallet/driver" },
        ],
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        title: "Settings",
        url: "#",
        icon: Settings,
        items: [
          { title: "Cities", url: "/settings/cities" },
          { title: "Popular routes", url: "/settings/popular-locations" },
          { title: "Ride types", url: "/settings/ride-types" },
          { title: "Vehicle makes", url: "/settings/vehicle-makes" },
          { title: "Vehicle models", url: "/settings/vehicle-models" },
        ],
      },
    ],
  },
  {
    label: "Mvest",
    items: [
      {
        title: "Mvest",
        url: "#",
        icon: TrendingUp,
        items: [
          { title: "Investors", url: "/mvest/investors" },
          { title: "Investor Vehicles", url: "/mvest/investor-vehicles" },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "User Management",
        url: "/user-management",
        icon: ShieldCheck,
      },
    ],
  },
]

function filterSectionsForRole(
  sections: RoleAwareNavSection[],
  role: Role
): NavSection[] {
  const filtered: NavSection[] = []

  for (const section of sections) {
    const items: NavItem[] = []

    for (const item of section.items) {
      if (item.items?.length) {
        // Parent with children: keep children the role can reach.
        const allowedChildren = item.items.filter((child) =>
          isPathAllowedForRole(child.url, role)
        )
        if (allowedChildren.length > 0) {
          items.push({ ...item, items: allowedChildren })
        }
      } else if (isPathAllowedForRole(item.url, role)) {
        items.push(item)
      }
    }

    if (items.length > 0) {
      filtered.push({ label: section.label, items })
    }
  }

  return filtered
}

function SidebarBrand() {
  const { state, isMobile } = useSidebar()
  const showTitle = state !== "collapsed" || isMobile

  return (
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" asChild tooltip="Met Ride Admin">
        <Link href="/dashboard" prefetch className="gap-2.5">
          <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-background/80 ring-1 ring-sidebar-border">
            <MetRideLogoMark fill priority />
          </span>
          {showTitle ? (
            <span className="truncate font-semibold tracking-tight">
              Met Ride Admin
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)

  const sections = useMemo(() => {
    if (!role) return []
    return filterSectionsForRole(navSections, role)
  }, [role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarBrand />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain sections={sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
            role: role,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
