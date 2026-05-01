import Link from "next/link"
import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconMail, IconPhone } from "@tabler/icons-react"
import getInitials from "@/lib/get-initials"
import { CustomerDetailDTO } from "@/actions/customers/getCustomer"

interface CustomerLayoutProps {
  customerId: string
  activeTab: "overview" | "bookings"
  customer: Pick<
    CustomerDetailDTO,
    "firstName" | "lastName" | "email" | "mobileNumber"
  >
  children: React.ReactNode
  header?: React.ReactNode
}

const CustomerLayout = ({
  customerId,
  activeTab,
  customer,
  children,
  header,
}: CustomerLayoutProps) => {
  const tabs = [
    {
      href: `/customers/${customerId}`,
      title: "Overview",
      isActive: activeTab === "overview",
    },
    {
      href: `/customers/${customerId}/bookings`,
      title: "Bookings",
      isActive: activeTab === "bookings",
    },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
      <div className="custom-scrollbar flex w-full flex-col gap-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-2 flex flex-col items-start justify-between gap-4 px-4 pt-4 md:flex-row md:items-center lg:px-6">
          <div className="flex flex-col gap-2">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-xl font-bold">
                {getInitials(customer.firstName, customer.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconMail size={14} />
                  {customer.email}
                </div>
                <div className="flex items-center gap-1">
                  <IconPhone size={14} />
                  {customer.mobileNumber}
                </div>
              </div>
            </div>
          </div>

          {header && <div>{header}</div>}
        </div>

        {/* Tabs navigation */}
        <div className="flex gap-6 border-b border-border px-4 lg:px-6">
          {tabs.map((tab, index) => (
            <Link
              key={index}
              href={tab.href}
              className={`pb-2 text-sm transition ${
                tab.isActive
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.title}
            </Link>
          ))}
        </div>

        {/* Tab content — no horizontal padding; children control their own */}
        <div>{children}</div>
      </div>
    </div>
  )
}

export default CustomerLayout
