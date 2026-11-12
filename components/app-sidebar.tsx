"use client"

import { useMemo } from "react"
import {
  Users,
  CarFront,
  CalendarCheck,
  LayoutDashboard,
  Wallet,
  RadioTower,
  ShieldCheck,
  TrendingUp,
  Tags,
  Gift,
  MapPin,
  Car,
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
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Live tracking", url: "/tracking", icon: RadioTower },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Bookings", url: "/booking", icon: CalendarCheck },
      { title: "Customers", url: "/customers", icon: Users },
      {
        title: "Drivers",
        url: "#",
        icon: CarFront,
        items: [
          { title: "All drivers", url: "/driver" },
          { title: "Active now", url: "/drivers/active" },
          { title: "Online rewards", url: "/drivers/online-rewards" },
        ],
      },
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
          { title: "Payouts", url: "/wallet/payouts" },
          { title: "Driver wallets", url: "/wallet/driver" },
        ],
      },
      {
        title: "Mvest",
        url: "#",
        icon: TrendingUp,
        items: [
          { title: "Owners", url: "/mvest/owners" },
          { title: "Agreements", url: "/mvest/agreements" },
          { title: "Earnings", url: "/mvest/earnings" },
        ],
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Promotions", url: "/promotions", icon: Tags },
      {
        title: "Driver rewards",
        url: "/settings/driver-online-reward",
        icon: Gift,
      },
      {
        title: "Locations",
        url: "#",
        icon: MapPin,
        items: [
          { title: "Cities", url: "/settings/cities" },
          { title: "Popular routes", url: "/settings/popular-locations" },
        ],
      },
      {
        title: "Fleet",
        url: "#",
        icon: Car,
        items: [
          { title: "Ride types", url: "/settings/ride-types" },
          { title: "Vehicle makes", url: "/settings/vehicle-makes" },
          { title: "Vehicle models", url: "/settings/vehicle-models" },
        ],
      },
      { title: "Admin users", url: "/user-management", icon: ShieldCheck },
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
