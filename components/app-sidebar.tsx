"use client"

import {
  Users,
  CarFront,
  CalendarCheck,
  LayoutDashboard,
  Wallet,
  RadioTower,
  Settings,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { MetRideLogoMark } from "@/components/brand/met-ride-logos"
import { NavMain, type NavSection } from "@/components/nav-main"
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
import Link from "next/link"

const navSections: NavSection[] = [
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
]

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarBrand />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
