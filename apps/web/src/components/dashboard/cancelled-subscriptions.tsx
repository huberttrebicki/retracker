import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Subscription } from "@/lib/api"

function formatTimeLeft(endsAt: string): string {
  const end = new Date(endsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()

  if (diffMs <= 0) return "Expired"

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 30) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    return remainingDays > 0
      ? `${months}mo ${remainingDays}d left`
      : `${months}mo left`
  }

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h left` : `${days}d left`
  }

  return `${hours}h left`
}

export function CancelledSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const cancelled = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "cancelled" && s.endsAt)
      .sort((a, b) => new Date(a.endsAt!).getTime() - new Date(b.endsAt!).getTime())
  }, [subscriptions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancelled Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {cancelled.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cancelled subscriptions</p>
        ) : (
        <div className="flex flex-col gap-3">
          {cancelled.map((sub) => {
            const timeLeft = formatTimeLeft(sub.endsAt!)
            const isExpired = timeLeft === "Expired"
            return (
              <div key={sub.id} className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{sub.provider.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Ends {new Date(sub.endsAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <Badge variant={isExpired ? "outline" : "secondary"}>
                  {timeLeft}
                </Badge>
              </div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
