import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, isPaymentOnDate, formatDateKey } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import type { Subscription } from "@/lib/api"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

export function UpcomingPayments({ subscriptions }: { subscriptions: Subscription[] }) {
  const { currency } = useCurrency()
  const today = formatDateKey(new Date())

  const upcoming = useMemo(() => {
    const now = new Date()
    const result: { sub: Subscription; date: Date }[] = []

    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
      for (const sub of subscriptions) {
        if (sub.status === "active" && isPaymentOnDate(sub, date)) {
          result.push({ sub, date })
        }
      }
    }
    return result.slice(0, 6)
  }, [subscriptions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {upcoming.map(({ sub, date }) => {
            const key = formatDateKey(date)
            const isToday = key === today
            return (
              <div key={`${sub.id}-${key}`} className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{sub.provider.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isToday ? "Today" : dateFormatter.format(date)}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(sub.price, currency)}
                </span>
              </div>
            )
          })}
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No upcoming payments
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
