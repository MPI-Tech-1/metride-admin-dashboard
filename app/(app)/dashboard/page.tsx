import AppLayout from "@/components/layouts/app-layout"
import { BreadcrumbItem } from "@/types/breadcrumb"

export default function Page() {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Dashboard",
      href: "#",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <p>Hello World</p>
    </AppLayout>
  )
}
