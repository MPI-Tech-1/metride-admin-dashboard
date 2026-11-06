import { redirect } from "next/navigation"

/** Old combined URL — makes and models now have their own settings pages. */
export default function Page() {
  redirect("/settings/vehicle-makes")
}
