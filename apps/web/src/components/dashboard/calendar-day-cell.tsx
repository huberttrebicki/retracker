import type { Subscription } from "@/lib/api"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/calendar"
import { useCurrency } from "@/lib/currency-context"
import { AvatarGroup } from "@/components/ui/avatar"

export function CalendarDayCell({
  date,
  subscriptions,
  isCurrentMonth,
  isToday,
  onClick,
}: {
  date: Date
  subscriptions: Subscription[]
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}) {
  const { currency, convert } = useCurrency()
  const total = subscriptions.reduce((sum, s) => sum + convert(Number(s.price), s.currency), 0)
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
              sub.provider.logo ? (
                <img key={sub.id} src={sub.provider.logo} alt={sub.provider.name} className="size-6 rounded-full border-2 border-background object-contain" />
              ) : (
                <div key={sub.id} className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-purple-100 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                  {sub.provider.name[0].toUpperCase()}
                </div>
              )
            ))}
            {overflow > 0 && (
              <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                +{overflow}
              </div>
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
