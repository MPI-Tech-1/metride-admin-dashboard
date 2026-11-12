"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type NavSubItem = { title: string; url: string }

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavSubItem[]
}

export type NavSection = {
  label: string
  items: NavItem[]
}

function matchesPath(pathname: string, url: string): boolean {
  if (!url || url === "#") return false
  return pathname === url || pathname.startsWith(`${url}/`)
}

/** The most specific nav URL matching the current path, so only one link lights up. */
function findActiveUrl(sections: NavSection[], pathname: string): string | null {
  let best: string | null = null
  for (const section of sections) {
    for (const item of section.items) {
      const urls = [item.url, ...(item.items?.map((sub) => sub.url) ?? [])]
      for (const url of urls) {
        if (matchesPath(pathname, url) && (!best || url.length > best.length)) {
          best = url
        }
      }
    }
  }
  return best
}

function renderNavItem(item: NavItem, activeUrl: string | null) {
  if (item.items?.length) {
    const hasActiveChild = item.items.some((sub) => sub.url === activeUrl)
    return (
      <Collapsible
        key={item.title}
        asChild
        defaultOpen={hasActiveChild}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subItem.url === activeUrl}
                  >
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        isActive={item.url === activeUrl}
      >
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavMain({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname()
  const activeUrl = findActiveUrl(sections, pathname)

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SidebarGroup
          key={section.label}
          className={cn(sectionIndex > 0 && "pt-0")}
        >
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
            {section.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => renderNavItem(item, activeUrl))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
