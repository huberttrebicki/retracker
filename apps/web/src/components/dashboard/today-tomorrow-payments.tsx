import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, isPaymentOnDate } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import type { Subscription } from "@/lib/api"

function PaymentList({ label, payments, currency }: { label: string; payments: Subscription[]; currency: string }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {payments.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">No payments</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {payments.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-2">
              <span className="truncate text-sm">{sub.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatCurrency(sub.price, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TodayTomorrowPayments({ subscriptions }: { subscriptions: Subscription[] }) {
  const { currency } = useCurrency()

  const { todayPayments, tomorrowPayments } = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active")
    const today = new Date()
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    return {
      todayPayments: active.filter((s) => isPaymentOnDate(s, today)),
      tomorrowPayments: active.filter((s) => isPaymentOnDate(s, tomorrow)),
    }
  }, [subscriptions])

  return (
    <Card>
      <CardContent className="flex gap-6 pt-4">
        <PaymentList label="Today" payments={todayPayments} currency={currency} />
        <div className="w-px bg-border" />
        <PaymentList label="Tomorrow" payments={tomorrowPayments} currency={currency} />
      </CardContent>
    </Card>
  )
}
