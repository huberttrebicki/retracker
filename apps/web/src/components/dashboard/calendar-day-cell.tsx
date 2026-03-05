import type { MockSubscription } from "@/data/mock"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"

const avatarColors = [
  "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
]

function getProviderColor(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % avatarColors.length
  return avatarColors[hash]
}

export function CalendarDayCell({
  date,
  subscriptions,
  isCurrentMonth,
  isToday,
  onClick,
}: {
  date: Date
  subscriptions: MockSubscription[]
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}) {
  const { currency } = useCurrency()
  const total = subscriptions.reduce((sum, s) => sum + s.price, 0)
  const visible = subscriptions.slice(0, 3)
  const overflow = subscriptions.length - 3

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={subscriptions.length === 0}
      className={cn(
        "flex flex-col gap-1.5 border-r border-b p-2 text-left transition-colors",
        isCurrentMonth
          ? "bg-card text-card-foreground"
          : "bg-muted/30 text-muted-foreground/50",
        subscriptions.length > 0 && "cursor-pointer hover:bg-accent",
        subscriptions.length === 0 && "cursor-default",
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center text-xs",
          isToday &&
            "rounded-full bg-primary text-primary-foreground font-medium",
        )}
      >
        {date.getDate()}
      </span>

      {subscriptions.length > 0 && (
        <>
          <AvatarGroup className="mt-auto">
            {visible.map((sub) => (
              <Avatar key={sub.id} size="sm">
                <AvatarFallback className={getProviderColor(sub.providerName)}>
                  {sub.providerName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflow > 0 && (
              <Avatar size="sm">
                <AvatarFallback className="text-[10px]">
                  +{overflow}
                </AvatarFallback>
              </Avatar>
            )}
          </AvatarGroup>
          <span className="text-xs font-medium text-muted-foreground">
            {formatCurrency(total, currency)}
          </span>
        </>
      )}
    </button>
  )
}
