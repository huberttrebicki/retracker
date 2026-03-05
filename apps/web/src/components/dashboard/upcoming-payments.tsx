import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockSubscriptions } from "@/data/mock"
import { formatCurrency, isPaymentOnDate, formatDateKey } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

function getUpcomingPayments() {
  const today = new Date()
  const upcoming: { sub: (typeof mockSubscriptions)[number]; date: Date }[] = []

  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    for (const sub of mockSubscriptions) {
      if (sub.status === "active" && isPaymentOnDate(sub, date)) {
        upcoming.push({ sub, date })
      }
    }
  }
  return upcoming.slice(0, 6)
}

const upcoming = getUpcomingPayments()

export function UpcomingPayments() {
  const { currency } = useCurrency()
  const today = formatDateKey(new Date())

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
                  <AvatarFallback>{sub.providerName[0]}</AvatarFallback>
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
