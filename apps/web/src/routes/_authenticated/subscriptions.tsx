import { useState } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import z from "zod"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  CalendarIcon,
  GlobeIcon,
  CirclePlayIcon,
  CirclePauseIcon,
  CircleXIcon,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api"
import type { Subscription } from "@/lib/api"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import { SubscriptionDialog } from "@/components/subscriptions/subscription-dialog"
import { DeleteSubscriptionDialog } from "@/components/subscriptions/delete-subscription-dialog"

const subscriptionsQuery = queryOptions({
  queryKey: ["subscriptions"],
  queryFn: async () => {
    const res = await client.api.subscriptions.$get()
    return await res.json()
  },
})

const allProvidersQuery = queryOptions({
  queryKey: ["all-providers"],
  queryFn: async () => {
    const res = await client.api.providers.$get()
    return await res.json()
  },
})

const currenciesQuery = queryOptions({
  queryKey: ["currencies"],
  queryFn: async () => {
    const res = await client.api.currencies.$get()
    return await res.json()
  },
})

export const Route = createFileRoute("/_authenticated/subscriptions")({
  validateSearch: z.object({
    create: z.boolean().optional(),
  }),
  loader: ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(subscriptionsQuery),
      queryClient.ensureQueryData(allProvidersQuery),
      queryClient.ensureQueryData(currenciesQuery),
    ])
  },
  component: SubscriptionsPage,
})

type Status = "active" | "paused" | "cancelled"

const statuses: { value: Status; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
]

function formatInterval(count: number, interval: string) {
  if (count === 1) return `/${interval}`
  return `/${count} ${interval}s`
}

function getNextPayment(startedAt: string, intervalCount: number, interval: string): Date {
  const start = new Date(startedAt)
  const now = new Date()
  const next = new Date(start)

  while (next <= now) {
    switch (interval) {
      case "day":
        next.setDate(next.getDate() + intervalCount)
        break
      case "week":
        next.setDate(next.getDate() + intervalCount * 7)
        break
      case "month":
        next.setMonth(next.getMonth() + intervalCount)
        break
      case "year":
        next.setFullYear(next.getFullYear() + intervalCount)
        break
    }
  }

  return next
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function SubscriptionsPage() {
  const queryClient = useQueryClient()
  const { data: subscriptions } = useSuspenseQuery(subscriptionsQuery)
  const { data: providers } = useSuspenseQuery(allProvidersQuery)
  const { data: currencies } = useSuspenseQuery(currenciesQuery)
  const { currency, convert } = useCurrency()

  const [activeStatus, setActiveStatus] = useState<Status>("active")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { create } = useSearch({ from: "/_authenticated/subscriptions" })
  const [dialogOpen, setDialogOpen] = useState(create ?? false)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] =
    useState<Subscription | null>(null)
  const [cancellingSubscription, setCancellingSubscription] =
    useState<Subscription | null>(null)
  const [cancelEndDate, setCancelEndDate] = useState("")

  const filtered = subscriptions.filter((s) => s.status === activeStatus)

  async function handleStatusChange(sub: Subscription, newStatus: Status) {
    if (sub.status === newStatus) return
    if (newStatus === "cancelled") {
      const calculatedEnd = getNextPayment(sub.startedAt, sub.intervalCount, sub.interval)
      setCancelEndDate(calculatedEnd.toISOString().split("T")[0])
      setCancellingSubscription(sub)
      return
    }
    await client.api.subscriptions[":id"].$patch({
      param: { id: sub.id },
      json: { status: newStatus, endsAt: null },
    })
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
  }

  async function confirmCancellation(endsAt: string | null) {
    if (!cancellingSubscription) return
    await client.api.subscriptions[":id"].$patch({
      param: { id: cancellingSubscription.id },
      json: {
        status: "cancelled" as const,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      },
    })
    setCancellingSubscription(null)
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
  }

  function handleCreate() {
    setEditingSubscription(null)
    setDialogOpen(true)
  }

  function handleEdit(sub: Subscription) {
    setEditingSubscription(sub)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <SidebarTrigger className="-ml-1" />
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setActiveStatus(s.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    activeStatus === s.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon />
              Add Subscription
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No {activeStatus} subscriptions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((sub) => {
                const isExpanded = expandedId === sub.id
                return (
                  <Card key={sub.id}>
                    <CardContent className="p-0">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between p-4 text-left"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : sub.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          {sub.provider.logo ? (
                            <img
                              src={sub.provider.logo}
                              alt={sub.provider.name}
                              className="size-8 rounded object-contain"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                              {sub.provider.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {sub.name}
                              </span>
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                                {sub.provider.category}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {sub.provider.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.status === "active" && (
                            <span className="text-xs text-muted-foreground">
                              Next: {formatDate(getNextPayment(sub.startedAt, sub.intervalCount, sub.interval))}
                            </span>
                          )}
                          <span className="text-sm font-medium">
                            {formatCurrency(convert(Number(sub.price), sub.currency), currency)}
                            <span className="text-muted-foreground font-normal">
                              {formatInterval(sub.intervalCount, sub.interval)}
                            </span>
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              "size-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t px-4 pb-4 pt-3">
                          {sub.description && (
                            <p className="mb-3 text-sm text-muted-foreground">
                              {sub.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Start Date
                              </span>
                              <p className="flex items-center gap-1">
                                <CalendarIcon className="size-3 text-muted-foreground" />
                                {new Date(sub.startedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            {sub.endsAt && (
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  End Date
                                </span>
                                <p className="flex items-center gap-1">
                                  <CalendarIcon className="size-3 text-muted-foreground" />
                                  {new Date(sub.endsAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            )}
                            {sub.status === "active" && (
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Next Payment
                                </span>
                                <p className="flex items-center gap-1">
                                  <CalendarIcon className="size-3 text-muted-foreground" />
                                  {formatDate(getNextPayment(sub.startedAt, sub.intervalCount, sub.interval))}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Billing Cycle
                              </span>
                              <p>
                                Every {sub.intervalCount} {sub.interval}
                                {sub.intervalCount > 1 ? "s" : ""}
                              </p>
                            </div>
                            {sub.provider.website && (
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Website
                                </span>
                                <a href={sub.provider.website.includes("://") ? sub.provider.website : `https://${sub.provider.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                  <GlobeIcon className="size-3 text-muted-foreground" />
                                  {sub.provider.website}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex justify-end gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-700 hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-400"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                }
                              >
                                {sub.status === "active" && <CirclePlayIcon />}
                                {sub.status === "paused" && <CirclePauseIcon />}
                                {sub.status === "cancelled" && <CircleXIcon />}
                                {statuses.find((s) => s.value === sub.status)?.label}
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {statuses
                                  .filter((s) => s.value !== sub.status)
                                  .map((s) => (
                                    <DropdownMenuItem
                                      key={s.value}
                                      onClick={() => handleStatusChange(sub, s.value)}
                                    >
                                      {s.value === "active" && <CirclePlayIcon className="size-4" />}
                                      {s.value === "paused" && <CirclePauseIcon className="size-4" />}
                                      {s.value === "cancelled" && <CircleXIcon className="size-4" />}
                                      {s.label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(sub)
                              }}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingSubscription(sub)
                              }}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <SubscriptionDialog
        key={editingSubscription?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSubscription}
        providers={providers}
        currencies={currencies}
      />

      <DeleteSubscriptionDialog
        open={!!deletingSubscription}
        onOpenChange={(open) => {
          if (!open) setDeletingSubscription(null)
        }}
        subscription={deletingSubscription}
      />

      <Dialog
        open={!!cancellingSubscription}
        onOpenChange={(open) => {
          if (!open) setCancellingSubscription(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              Your subscription to "{cancellingSubscription?.name}" will expire on:
            </DialogDescription>
          </DialogHeader>
          <Input
            type="date"
            value={cancelEndDate}
            onChange={(e) => setCancelEndDate(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => confirmCancellation(null)}
            >
              Cancel without end date
            </Button>
            <Button onClick={() => confirmCancellation(cancelEndDate)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
