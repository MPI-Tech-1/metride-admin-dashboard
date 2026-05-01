import AppLayout from "@/components/layouts/app-layout"
import CustomerLayout from "@/components/layouts/customer-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import getCustomer from "@/actions/customers/getCustomer"
import { format, formatDistanceToNow } from "date-fns"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconClock,
} from "@tabler/icons-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const customer = await getCustomer(id)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Customers", href: "/customers" },
    { title: "Customer Details", href: "#" },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CustomerLayout
        customerId={id}
        activeTab="overview"
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          mobileNumber: customer.mobileNumber,
        }}
      >
        <div className="px-4 pb-6 lg:px-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border p-4 shadow-sm sm:p-6">
              <div className="mb-6">
                <h3 className="text-base font-semibold sm:text-lg">
                  Personal Information
                </h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Basic account details for this customer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                  label="First Name"
                  value={customer.firstName}
                  icon={<IconUser size={16} />}
                />
                <InfoItem
                  label="Last Name"
                  value={customer.lastName}
                  icon={<IconUser size={16} />}
                />
                <InfoItem
                  label="Email Address"
                  value={customer.email}
                  icon={<IconMail size={16} />}
                />
                <InfoItem
                  label="Mobile Number"
                  value={customer.mobileNumber}
                  icon={<IconPhone size={16} />}
                />
                <InfoItem
                  label="Last Seen"
                  value={
                    customer.lastLoggedInAt
                      ? `${formatDistanceToNow(new Date(customer.lastLoggedInAt), { addSuffix: true })} · ${format(new Date(customer.lastLoggedInAt), "PPp")}`
                      : "Never logged in"
                  }
                  icon={<IconClock size={16} />}
                />
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    </AppLayout>
  )
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
