import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { LoaderIcon } from "lucide-react"
import { client } from "@/lib/api"
import type { Subscription, AllProviders, Currency } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null
  providers: AllProviders[]
  currencies: Currency[]
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  providers,
  currencies,
}: SubscriptionDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const isEdit = !!subscription

  const form = useForm({
    defaultValues: {
      name: subscription?.name ?? "",
      providerId: (subscription as any)?.provider?.id ?? "",
      currencyId: subscription
        ? currencies.find((c) => c.code === subscription.currency)?.id ?? ""
        : "",
      description: subscription?.description ?? "",
      startedAt: subscription?.startedAt
        ? new Date(subscription.startedAt).toISOString().split("T")[0]
        : "",
      intervalCount: subscription?.intervalCount ?? 1,
      interval: subscription?.interval ?? "month",
      price: subscription?.price ? Number(subscription.price) : 0,
    },
    onSubmit: async ({ value }) => {
      setError("")
      try {
        const payload = {
          name: value.name,
          providerId: value.providerId,
          currencyId: value.currencyId,
          description: value.description || null,
          startedAt: new Date(value.startedAt),
          intervalCount: value.intervalCount,
          interval: value.interval as "day" | "week" | "month" | "year",
          price: value.price,
        }

        if (isEdit && subscription) {
          await client.api.subscriptions[":id"].$patch({
            param: { id: subscription.id },
            json: payload,
          })
        } else {
          await client.api.subscriptions.$post({
            json: {
              ...payload,
              metadata: {},
            },
          })
        }
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
        onOpenChange(false)
      } catch {
        setError("Failed to save subscription")
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the subscription details."
              : "Create a new subscription to track."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="e.g. Netflix Premium"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                )}
              </Field>
            )}
          </form.Field>

          <form.Field
            name="providerId"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Provider is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Provider</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val as string)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a provider">
                      {providers.find((p) => p.id === field.state.value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                )}
              </Field>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="currencyId"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Currency is required" : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Currency</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency">
                        {currencies.find((c) => c.id === field.state.value)
                          ?.code}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="price"
              validators={{
                onBlur: ({ value }) =>
                  !value || value <= 0 ? "Price must be positive" : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Price</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="intervalCount"
              validators={{
                onBlur: ({ value }) =>
                  !value || value < 1
                    ? "Must be at least 1"
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Every</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value) || 1)
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="interval">
              {(field) => (
                <Field>
                  <FieldLabel>Interval</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {field.state.value.charAt(0).toUpperCase() +
                          field.state.value.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </div>

          <form.Field
            name="startedAt"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Start date is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Start Date</FieldLabel>
                <Input
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                )}
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel>
                  Description{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  placeholder="Notes about this subscription..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                />
              </Field>
            )}
          </form.Field>

          {error && <FieldError>{error}</FieldError>}

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <LoaderIcon className="animate-spin" />}
                  {isEdit ? "Save Changes" : "Create Subscription"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
