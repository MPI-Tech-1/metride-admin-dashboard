import Link from "next/link"
import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconCircleCheckFilled,
  IconCircleX,
  IconLoader,
  IconMail,
  IconPhone,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import getInitials from "@/lib/get-initials"
import { DriverDetailDTO } from "@/actions/drivers/getDriver"
interface DriverLayoutProps {
  activeTab: "overview"
  children: React.ReactNode
  driver: Pick<
    DriverDetailDTO,
    | "firstName"
    | "lastName"
    | "email"
    | "mobileNumber"
    | "status"
    | "driverDocument"
  >
  header?: React.ReactNode
}

const DriverLayout = ({
  activeTab,
  driver,
  children,
  header,
}: DriverLayoutProps) => {
  const driverTabs = [
    {
      href: "#",
      title: "Overview",
      isActive: activeTab === "overview",
    },
  ]

  const statusIcons = {
    approved: <IconCircleCheckFilled className="text-green-500" size={18} />,
    pending: <IconLoader className="animate-spin text-yellow-500" size={18} />,
    rejected: <IconCircleX className="text-red-500" size={18} />,
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="custom-scrollbar flex w-full flex-col gap-6 overflow-y-auto px-4 py-4 transition-all duration-300 lg:px-6">
        {/* Header */}
        <div className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarImage
                src={driver.driverDocument.passportPhotographUrl || ""}
              />
              <AvatarFallback className="bg-primary/5 text-xl font-bold">
                {getInitials(driver.firstName, driver.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {driver.firstName} {driver.lastName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconMail size={14} /> {driver.email}
                </div>
                <div className="flex items-center gap-1">
                  <IconPhone size={14} /> {driver.mobileNumber}
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 py-0.5 capitalize"
                >
                  {statusIcons[driver.status]}
                  {driver.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Optional header slot */}
          {header && <div>{header}</div>}
        </div>

        {/* Tabs navigation */}
        <div className="flex gap-6 border-b border-border">
          {driverTabs.map((driverTab, index) => (
            <Link
              key={index}
              href={driverTab.href}
              className={`pb-2 text-sm transition ${
                driverTab.isActive
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {driverTab.title}
            </Link>
          ))}
        </div>

        {/* Tab content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DriverLayout
