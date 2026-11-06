import { Fragment } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BreadcrumbItem as BreadcrumbItemType } from "@/types/breadcrumb"

interface LayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItemType[]
}

export default function Layout({ children, breadcrumbs }: LayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex min-w-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 text-muted-foreground" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs?.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    return (
                      <Fragment key={`${item.title}-${index}`}>
                        <BreadcrumbItem
                          className={isLast ? undefined : "hidden md:block"}
                        >
                          {isLast || item.href === "#" ? (
                            <BreadcrumbPage
                              className={
                                isLast ? "font-medium" : "text-muted-foreground"
                              }
                            >
                              {item.title}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={item.href}>
                              {item.title}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-2">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
