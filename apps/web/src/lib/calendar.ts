import type { Subscription } from "@/lib/api";

export function formatDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function getCalendarDays(year: number, month: number): Date[] {
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// Monday = 0, Sunday = 6
	const startDow = (firstDay.getDay() + 6) % 7;
	const endDow = (lastDay.getDay() + 6) % 7;

	const start = new Date(year, month, 1 - startDow);
	const end = new Date(year, month + 1, 0 + (6 - endDow));

	const days: Date[] = [];
	const current = new Date(start);
	while (current <= end) {
		days.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}
	return days;
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

export function isPaymentOnDate(sub: Subscription, date: Date): boolean {
	const startDate = new Date(sub.startedAt);
	if (date < startDate) return false;
	if (sub.endsAt && date > new Date(sub.endsAt)) return false;
	if (sub.status === "cancelled" && !sub.endsAt) return false;

	const dy = date.getFullYear();
	const dm = date.getMonth();
	const dd = date.getDate();
	const sy = startDate.getFullYear();
	const sm = startDate.getMonth();
	const sd = startDate.getDate();

	switch (sub.interval) {
		case "month": {
			const monthDiff = (dy - sy) * 12 + (dm - sm);
			if (monthDiff < 0 || monthDiff % sub.intervalCount !== 0) return false;
			const maxDay = daysInMonth(dy, dm);
			const expectedDay = Math.min(sd, maxDay);
			return dd === expectedDay;
		}
		case "week": {
			const diffTime = date.getTime() - startDate.getTime();
			const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
			return diffDays >= 0 && diffDays % (sub.intervalCount * 7) === 0;
		}
		case "day": {
			const diffTime = date.getTime() - startDate.getTime();
			const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
			return diffDays >= 0 && diffDays % sub.intervalCount === 0;
		}
		case "year": {
			const yearDiff = dy - sy;
			if (yearDiff < 0 || yearDiff % sub.intervalCount !== 0) return false;
			const maxDay = daysInMonth(dy, dm);
			const expectedDay = Math.min(sd, maxDay);
			return dm === sm && dd === expectedDay;
		}
		default:
			return false;
	}
}

export function getSubscriptionsByDay(
	subscriptions: Subscription[],
	year: number,
	month: number,
): Map<string, Subscription[]> {
	const days = getCalendarDays(year, month);
	const map = new Map<string, Subscription[]>();

	for (const day of days) {
		const key = formatDateKey(day);
		for (const sub of subscriptions) {
			if (isPaymentOnDate(sub, day)) {
				const existing = map.get(key);
				if (existing) {
					existing.push(sub);
				} else {
					map.set(key, [sub]);
				}
			}
		}
	}

	return map;
}

export function formatCurrency(amount: number, code = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
	}).format(amount);
}
