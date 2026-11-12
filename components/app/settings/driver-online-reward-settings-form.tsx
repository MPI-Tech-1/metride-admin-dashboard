"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { DriverOnlineRewardSettingsDTO } from "@/actions/settings/getDriverOnlineRewardSettings"
import updateDriverOnlineRewardSettings, {
  type UpdateDriverOnlineRewardSettingsBody,
} from "@/actions/settings/updateDriverOnlineRewardSettings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatNaira } from "@/lib/format-currency"

interface FormState {
  isEnabled: boolean
  windowStartTime: string
  windowEndTime: string
  rewardAmountNaira: string
  graceMinutes: string
  acceptanceTimeoutMinutes: string
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function settingsToForm(settings: DriverOnlineRewardSettingsDTO): FormState {
  return {
    isEnabled: settings.isEnabled,
    windowStartTime: settings.windowStartTime.slice(0, 5),
    windowEndTime: settings.windowEndTime.slice(0, 5),
    rewardAmountNaira: String(settings.rewardAmount / 100),
    graceMinutes: String(settings.graceMinutes),
    acceptanceTimeoutMinutes: String(settings.acceptanceTimeoutMinutes),
  }
}

function parseNonNegativeInteger(raw: string): number | null {
  if (raw.trim() === "") return null
  const value = Number(raw)
  return Number.isInteger(value) && value >= 0 ? value : null
}

function parseForm(
  form: FormState
):
  | { ok: true; body: UpdateDriverOnlineRewardSettingsBody }
  | { ok: false; message: string } {
  if (
    !TIME_PATTERN.test(form.windowStartTime) ||
    !TIME_PATTERN.test(form.windowEndTime)
  ) {
    return { ok: false, message: "Enter a valid start and end time." }
  }
  if (form.windowStartTime === form.windowEndTime) {
    return {
      ok: false,
      message: "The reward window start and end time cannot be the same.",
    }
  }

  const cleanedAmount = form.rewardAmountNaira.replace(/,/g, "").trim()
  const amountNaira = Number(cleanedAmount)
  if (!cleanedAmount || !Number.isFinite(amountNaira) || amountNaira < 0) {
    return { ok: false, message: "Enter a valid reward amount in naira." }
  }
  const rewardAmount = Math.round(amountNaira * 100)
  if (form.isEnabled && rewardAmount <= 0) {
    return {
      ok: false,
      message: "Reward amount must be greater than ₦0 when the reward is enabled.",
    }
  }

  const graceMinutes = parseNonNegativeInteger(form.graceMinutes)
  const acceptanceTimeoutMinutes = parseNonNegativeInteger(
    form.acceptanceTimeoutMinutes
  )
  if (graceMinutes === null || acceptanceTimeoutMinutes === null) {
    return {
      ok: false,
      message: "Grace and acceptance timeout must be whole numbers of minutes.",
    }
  }

  return {
    ok: true,
    body: {
      isEnabled: form.isEnabled,
      windowStartTime: form.windowStartTime,
      windowEndTime: form.windowEndTime,
      rewardAmount,
      graceMinutes,
      acceptanceTimeoutMinutes,
    },
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function DriverOnlineRewardSettingsForm({
  settings,
}: {
  settings: DriverOnlineRewardSettingsDTO
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => settingsToForm(settings))
  const [current, setCurrent] = useState(settings)
  const [pending, startTransition] = useTransition()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(settingsToForm(current))

  function submit() {
    const parsed = parseForm(form)
    if (!parsed.ok) {
      toast.error(parsed.message)
      return
    }
    startTransition(async () => {
      const result = await updateDriverOnlineRewardSettings(parsed.body)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setCurrent(result.settings)
      setForm(settingsToForm(result.settings))
      router.refresh()
    })
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Online reward</CardTitle>
          <Badge
            variant={current.isEnabled ? "default" : "secondary"}
            className={current.isEnabled ? "bg-emerald-600 text-white" : ""}
          >
            {current.isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          {current.isEnabled
            ? `Drivers who stay online between ${current.windowStartTime} and ${current.windowEndTime} (${current.timezone}) earn ${formatNaira(current.rewardAmount)}.`
            : "Drivers are not currently being rewarded for staying online."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-5">
          <div className="flex items-start gap-3 rounded-lg border px-3 py-3">
            <Checkbox
              id="reward-enabled"
              checked={form.isEnabled}
              onCheckedChange={(checked) =>
                update("isEnabled", checked === true)
              }
              disabled={pending}
              className="mt-0.5"
            />
            <div className="grid gap-1">
              <FieldLabel htmlFor="reward-enabled" className="cursor-pointer">
                Enable online reward
              </FieldLabel>
              <p className="text-xs text-muted-foreground">
                When enabled, drivers who stay online through the whole window
                are paid the reward amount once per day.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="reward-window-start">Window starts</FieldLabel>
              <Input
                id="reward-window-start"
                type="time"
                value={form.windowStartTime}
                onChange={(event) =>
                  update("windowStartTime", event.target.value)
                }
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="reward-window-end">Window ends</FieldLabel>
              <Input
                id="reward-window-end"
                type="time"
                value={form.windowEndTime}
                onChange={(event) =>
                  update("windowEndTime", event.target.value)
                }
                disabled={pending}
              />
            </Field>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">
            Times are in {current.timezone}.
          </p>

          <Field>
            <FieldLabel htmlFor="reward-amount">Reward amount (₦)</FieldLabel>
            <Input
              id="reward-amount"
              inputMode="decimal"
              value={form.rewardAmountNaira}
              onChange={(event) =>
                update("rewardAmountNaira", event.target.value)
              }
              placeholder="500"
              disabled={pending}
            />
            <FieldDescription>
              Enter the amount in naira. It is converted to kobo before saving.
            </FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="reward-grace">Grace period (minutes)</FieldLabel>
              <Input
                id="reward-grace"
                type="number"
                min={0}
                step={1}
                value={form.graceMinutes}
                onChange={(event) => update("graceMinutes", event.target.value)}
                disabled={pending}
              />
              <FieldDescription>
                How many minutes offline a driver is allowed during the window.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="reward-acceptance">
                Acceptance timeout (minutes)
              </FieldLabel>
              <Input
                id="reward-acceptance"
                type="number"
                min={0}
                step={1}
                value={form.acceptanceTimeoutMinutes}
                onChange={(event) =>
                  update("acceptanceTimeoutMinutes", event.target.value)
                }
                disabled={pending}
              />
              <FieldDescription>
                How long a driver has to accept a trip offer during the window.
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t">
        <span className="text-xs text-muted-foreground">
          Last updated {formatDateTime(current.updatedAt)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setForm(settingsToForm(current))}
            disabled={pending || !isDirty}
          >
            Reset
          </Button>
          <Button onClick={submit} disabled={pending || !isDirty}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
