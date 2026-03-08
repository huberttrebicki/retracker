import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Subscription } from "@/lib/api";
import {
	formatDateKey,
	getCalendarDays,
	getSubscriptionsByDay,
	formatCurrency,
} from "@/lib/calendar";
import { useCurrency } from "@/lib/currency-context";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDayCell } from "./calendar-day-cell";
import { DayDetailDialog } from "./day-detail-dialog";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

export function CalendarGrid({
	subscriptions,
}: {
	subscriptions: Subscription[];
}) {
	const [currentDate, setCurrentDate] = React.useState(() => new Date());
	const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
	const { currency, convert } = useCurrency();

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const calendarDays = React.useMemo(
		() => getCalendarDays(year, month),
		[year, month],
	);

	const subscriptionsByDay = React.useMemo(
		() => getSubscriptionsByDay(subscriptions, year, month),
		[subscriptions, year, month],
	);

	const monthlyTotal = React.useMemo(() => {
		let total = 0;
		for (const [key, subs] of subscriptionsByDay) {
			const d = new Date(key);
			if (d.getMonth() === month) {
				total += subs.reduce(
					(sum, s) => sum + convert(Number(s.price), s.currency),
					0,
				);
			}
		}
		return formatCurrency(total, currency);
	}, [subscriptionsByDay, month, currency, convert]);

	const rows = calendarDays.length / 7;
	const selectedDaySubs = selectedDate
		? (subscriptionsByDay.get(selectedDate) ?? [])
		: [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>{monthFormatter.format(new Date(year, month))}</CardTitle>
				<CardDescription>{monthlyTotal} in payments this month</CardDescription>
				<CardAction>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
						>
							<ChevronLeftIcon />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentDate(new Date())}
						>
							Today
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
						>
							<ChevronRightIcon />
						</Button>
					</div>
				</CardAction>
			</CardHeader>

			<CardContent className="px-0 pb-0">
				<div className="grid grid-cols-7 border-t">
					{weekdays.map((day) => (
						<div
							key={day}
							className="border-b px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
						>
							{day}
						</div>
					))}
				</div>

				<div
					className="grid grid-cols-7"
					style={{ gridTemplateRows: `repeat(${rows}, minmax(6.5rem, auto))` }}
				>
					{calendarDays.map((date) => {
						const key = formatDateKey(date);
						const subs = subscriptionsByDay.get(key) ?? [];
						return (
							<CalendarDayCell
								key={key}
								date={date}
								subscriptions={subs}
								isCurrentMonth={date.getMonth() === month}
								isToday={formatDateKey(date) === formatDateKey(new Date())}
								onClick={() => subs.length > 0 && setSelectedDate(key)}
							/>
						);
					})}
				</div>
			</CardContent>

			<DayDetailDialog
				open={selectedDate !== null}
				onOpenChange={(open) => !open && setSelectedDate(null)}
				date={selectedDate ? new Date(selectedDate + "T00:00:00") : null}
				subscriptions={selectedDaySubs}
			/>
		</Card>
	);
}
