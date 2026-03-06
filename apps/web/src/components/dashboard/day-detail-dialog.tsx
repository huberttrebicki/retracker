import type { Subscription } from "@/lib/api"
import { formatCurrency } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
})

const statusVariant = {
  active: "default",
  paused: "secondary",
  cancelled: "destructive",
} as const

export function DayDetailDialog({
  open,
  onOpenChange,
  date,
  subscriptions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  subscriptions: Subscription[]
}) {
  const { currency } = useCurrency()
  const total = subscriptions.reduce((sum, s) => sum + s.price, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{date ? dateFormatter.format(date) : ""}</DialogTitle>
          <DialogDescription>
            {subscriptions.length} subscription
            {subscriptions.length !== 1 ? "s" : ""} &middot;{" "}
            {formatCurrency(total, currency)} total
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          {subscriptions.map((sub, i) => (
            <div key={sub.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 py-3">
                <Avatar>
                  <AvatarFallback>{sub.provider.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.provider.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(sub.price, currency)}
                  </span>
                  <Badge variant={statusVariant[sub.status as keyof typeof statusVariant] ?? "default"}>{sub.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
