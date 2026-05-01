import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"
import getDriver from "@/actions/drivers/getDriver"
import { Badge } from "@/components/ui/badge"
// import { Card, CardContent } from "@/components/ui/card"
import {
  IconCircleCheckFilled,
  IconLoader,
  IconCircleX,
  IconUser,
  IconCalendar,
  IconMapPin,
  IconId,
  IconBuildingBank,
  IconCreditCard,
  IconCheck,
  IconClock,
  IconFileDescription,
} from "@tabler/icons-react"
import { format } from "date-fns"
import DriverLayout from "@/components/layouts/driver-layout"
import { Pencil } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const driver = await getDriver(id)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Drivers",
      href: "/driver",
    },
    {
      title: "Driver Details",
      href: "#",
    },
  ]

  const statusIcons = {
    approved: <IconCircleCheckFilled className="text-green-500" size={18} />,
    pending: <IconLoader className="animate-spin text-yellow-500" size={18} />,
    rejected: <IconCircleX className="text-red-500" size={18} />,
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <DriverLayout
          activeTab="overview"
          driver={{
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            mobileNumber: driver.mobileNumber,
            status: driver.status,
            driverDocument: driver.driverDocument,
          }}
        >
          <div className="grid grid-cols-1 gap-6 pb-3">
            {/* Personal Information (3/4) */}
            <div className="rounded-lg border p-4 shadow-sm sm:p-6 lg:col-span-8">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold sm:text-lg">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    This section contains the driver personal information.
                  </p>
                </div>
                <button className="mt-1">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoItem
                    label="Date of Birth"
                    value={
                      driver.driverPersonalInformation.dateOfBirth
                        ? format(
                            new Date(
                              driver.driverPersonalInformation.dateOfBirth
                            ),
                            "PPP"
                          )
                        : "Not Provided"
                    }
                    icon={<IconCalendar size={16} />}
                  />

                  <InfoItem
                    label="Account Number"
                    value={
                      driver.driverBankAccount.accountNumber || "Not Provided"
                    }
                    icon={<IconCreditCard size={16} />}
                  />

                  <InfoItem
                    label="Account Name"
                    value={
                      driver.driverBankAccount.accountName || "Not Provided"
                    }
                    icon={<IconUser size={16} />}
                  />

                  <InfoItem
                    label="Gender"
                    value={
                      driver.driverPersonalInformation.gender || "Not Provided"
                    }
                    icon={<IconUser size={16} />}
                  />

                  <InfoItem
                    label="NIN"
                    value={
                      driver.driverPersonalInformation
                        .nationalIdentificationNumber || "Not Provided"
                    }
                    icon={<IconId size={16} />}
                  />

                  <InfoItem
                    label="Home Address"
                    value={
                      driver.driverPersonalInformation.homeAddress ||
                      "Not Provided"
                    }
                    icon={<IconMapPin size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pb-4 lg:grid-cols-3">
            <div className="rounded-lg border p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold sm:text-lg">
                    Registration Progress
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    This section contains the driver registration progress.
                  </p>
                </div>
                <button className="mt-1">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-4 space-y-3 sm:space-y-4">
                <ProgressItem
                  label="Account Activated"
                  completed={driver.driverRegistrationStep.hasActivatedAccount}
                />
                <ProgressItem
                  label="Personal Information"
                  completed={
                    driver.driverRegistrationStep.hasProvidedPersonalInformation
                  }
                />
                <ProgressItem
                  label="Vehicle Information"
                  completed={
                    driver.driverRegistrationStep.hasProvidedVehicleInformation
                  }
                />
                <ProgressItem
                  label="Required Documents"
                  completed={
                    driver.driverRegistrationStep.hasProvidedRequiredDocuments
                  }
                />
                <ProgressItem
                  label="Bank Account"
                  completed={
                    driver.driverRegistrationStep.hasProvidedBankAccount
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold sm:text-lg">
                    Approval History
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Historical record of status changes and reasons.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 space-y-6">
                {/* vertical line */}
                <div className="absolute top-0 left-3 h-full w-[2px] bg-border" />

                {driver.driverApprovalSteps.length > 0 ? (
                  driver.driverApprovalSteps.map((step) => (
                    <div key={step.identifier} className="relative flex gap-4">
                      {/* status dot */}
                      <div
                        className={`z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
                          step.status === "approved"
                            ? "bg-green-500"
                            : step.status === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      >
                        {step.status === "approved" ? (
                          <IconCheck size={14} />
                        ) : step.status === "rejected" ? (
                          <IconCircleX size={14} />
                        ) : (
                          <IconClock size={14} />
                        )}
                      </div>

                      {/* content */}
                      <div className="flex flex-col gap-1 pb-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium capitalize">
                            {step.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {format(new Date(step.createdAt), "PPp")}
                          </span>
                        </div>

                        {step.reason && (
                          <p className="text-sm text-muted-foreground">
                            {step.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No approval steps recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Bank Information */}
            <div className="rounded-lg border p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold sm:text-lg">
                    Bank Information
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    This section contains the driver payment account details.
                  </p>
                </div>
                <button className="mt-1">
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-4 space-y-3 sm:space-y-4">
                <InfoItem
                  label="Bank Name"
                  value={driver.driverBankAccount.bank || "Not Provided"}
                  icon={<IconBuildingBank size={16} />}
                />

                <InfoItem
                  label="Account Number"
                  value={
                    driver.driverBankAccount.accountNumber || "Not Provided"
                  }
                  icon={<IconCreditCard size={16} />}
                />

                <InfoItem
                  label="Account Name"
                  value={driver.driverBankAccount.accountName || "Not Provided"}
                  icon={<IconUser size={16} />}
                />
              </div>
            </div>

            {/* Approval History */}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DocumentCard
              title="Passport Photograph"
              url={driver.driverDocument.passportPhotographUrl}
            />
            <DocumentCard
              title="Driver's License"
              url={driver.driverDocument.driverLicenceUrl}
            />
            <DocumentCard
              title="Vehicle Papers"
              url={driver.driverDocument.vehiclePaperUrl}
            />
            <DocumentCard
              title="Vehicle Photo"
              url={driver.driverDocument.vehiclePhotoUrl}
            />
          </div>
        </DriverLayout>
      </div>
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

function ProgressItem({
  label,
  completed,
}: {
  label: string
  completed: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span
        className={`text-sm ${
          completed ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      <div>
        {completed ? (
          <Badge
            variant="secondary"
            className="flex w-fit items-center border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20"
          >
            <IconCheck size={14} className="mr-1" />
            Completed
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="flex w-fit items-center border-yellow-500/20 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
          >
            <IconClock size={14} className="mr-1" />
            Pending
          </Badge>
        )}
      </div>
    </div>
  )
}

function DocumentCard({ title, url }: { title: string; url: string | null }) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <div className="relative aspect-[4/3] bg-muted">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </a>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <IconFileDescription size={28} stroke={1} />
            <span className="text-xs">No document</span>
          </div>
        )}
      </div>

      <div className="p-3 text-center">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>
    </div>
  )
}
