import { CircleCheckIcon } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CircleCheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Payment Received!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your payment. We have successfully received your
            transaction and your booking is being processed.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border" />

        {/* Info */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>You will receive a confirmation shortly.</p>
          <p>You can now close this page.</p>
        </div>
      </div>
    </div>
  )
}
