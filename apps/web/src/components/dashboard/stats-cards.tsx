import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, isPaymentOnDate } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import type { Subscription } from "@/lib/api"

export function StatsCards({ subscriptions }: { subscriptions: Subscription[] }) {
  const { currency, convert } = useCurrency()

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active")

    const monthlyEstimate = active.reduce((sum, s) => {
      const price = convert(Number(s.price), s.currency)
      switch (s.interval) {
        case "month":
          return sum + price / s.intervalCount
        case "week":
          return sum + (price / (s.intervalCount * 7)) * 30
        case "day":
          return sum + (price / s.intervalCount) * 30
        case "year":
          return sum + price / (s.intervalCount * 12)
        default:
          return sum
      }
    }, 0)

    const yearlyEstimate = monthlyEstimate * 12
    const dailyCost = monthlyEstimate / 30

    const today = new Date()
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()
    let remainingTotal = 0
    let remainingCount = 0
    const seen = new Set<string>()
    for (let d = today.getDate() + 1; d <= daysInMonth; d++) {
      const date = new Date(today.getFullYear(), today.getMonth(), d)
      for (const sub of active) {
        if (isPaymentOnDate(sub, date) && !seen.has(`${sub.id}-${d}`)) {
          seen.add(`${sub.id}-${d}`)
          remainingTotal += convert(Number(sub.price), sub.currency)
          remainingCount++
        }
      }
    }

    const categoryCount = new Set(active.map((s) => s.provider.category)).size

    return [
      {
        title: "Monthly Cost",
        value: formatCurrency(monthlyEstimate, currency),
        footer: `~${formatCurrency(dailyCost, currency)}/day`,
      },
      {
        title: "Remaining This Month",
        value: formatCurrency(remainingTotal, currency),
        footer: `${remainingCount} payment${remainingCount !== 1 ? "s" : ""} left`,
      },
      {
        title: "Active Subscriptions",
        value: active.length.toString(),
        footer: `across ${categoryCount} categories`,
      },
      {
        title: "Yearly Cost",
        value: formatCurrency(yearlyEstimate, currency),
        footer: `~${formatCurrency(monthlyEstimate, currency)}/month`,
      },
    ]
  }, [subscriptions, currency, convert])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.footer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
