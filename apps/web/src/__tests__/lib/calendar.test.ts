import { describe, test, expect } from "bun:test";
import {
	formatDateKey,
	getCalendarDays,
	isPaymentOnDate,
	getSubscriptionsByDay,
	formatCurrency,
} from "../../lib/calendar";

// Minimal subscription shape for testing
function makeSub(overrides: Record<string, unknown> = {}) {
	return {
		id: "test-id",
		name: "Test Sub",
		description: null,
		provider: { id: "p1", name: "Provider", website: null, category: "Other", logo: null },
		currency: "USD",
		startedAt: "2024-01-15T00:00:00.000Z",
		intervalCount: 1,
		interval: "month" as const,
		price: "9.99",
		metadata: {},
		endsAt: null,
		status: "active" as const,
		...overrides,
	} as any;
}

describe("formatDateKey", () => {
	test("formats date as YYYY-MM-DD", () => {
		expect(formatDateKey(new Date(2024, 0, 15))).toBe("2024-01-15");
	});

	test("pads single-digit month and day", () => {
		expect(formatDateKey(new Date(2024, 2, 5))).toBe("2024-03-05");
	});

	test("handles December correctly", () => {
		expect(formatDateKey(new Date(2024, 11, 31))).toBe("2024-12-31");
	});

	test("handles January correctly", () => {
		expect(formatDateKey(new Date(2024, 0, 1))).toBe("2024-01-01");
	});
});

describe("getCalendarDays", () => {
	test("returns array of dates", () => {
		const days = getCalendarDays(2024, 0); // January 2024
		expect(days.length).toBeGreaterThan(0);
		expect(days[0]).toBeInstanceOf(Date);
	});

	test("returns full weeks (length divisible by 7)", () => {
		const days = getCalendarDays(2024, 0);
		expect(days.length % 7).toBe(0);
	});

	test("starts on Monday", () => {
		const days = getCalendarDays(2024, 0);
		// getDay(): 0=Sunday, 1=Monday
		expect(days[0].getDay()).toBe(1);
	});

	test("ends on Sunday", () => {
		const days = getCalendarDays(2024, 0);
		const lastDay = days[days.length - 1];
		expect(lastDay.getDay()).toBe(0);
	});

	test("includes all days of the target month", () => {
		const days = getCalendarDays(2024, 1); // February 2024 (leap year)
		const febDays = days.filter(
			(d) => d.getMonth() === 1 && d.getFullYear() === 2024,
		);
		expect(febDays.length).toBe(29);
	});

	test("handles leap year February", () => {
		const days = getCalendarDays(2024, 1);
		const febDays = days.filter(
			(d) => d.getMonth() === 1 && d.getFullYear() === 2024,
		);
		expect(febDays.length).toBe(29);
	});

	test("handles non-leap year February", () => {
		const days = getCalendarDays(2023, 1);
		const febDays = days.filter(
			(d) => d.getMonth() === 1 && d.getFullYear() === 2023,
		);
		expect(febDays.length).toBe(28);
	});
});

describe("isPaymentOnDate — monthly", () => {
	test("payment falls on start date", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
	});

	test("payment falls on same day next month", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		expect(isPaymentOnDate(sub, new Date(2024, 1, 15))).toBe(true);
	});

	test("no payment on different day of month", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		expect(isPaymentOnDate(sub, new Date(2024, 1, 14))).toBe(false);
	});

	test("no payment before start date", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		expect(isPaymentOnDate(sub, new Date(2023, 11, 15))).toBe(false);
	});

	test("handles end-of-month clamping (Jan 31 → Feb 28/29)", () => {
		const sub = makeSub({ startedAt: "2024-01-31T00:00:00.000Z" });
		// Feb 2024 is leap year, so 29 days
		expect(isPaymentOnDate(sub, new Date(2024, 1, 29))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2024, 1, 28))).toBe(false);
	});

	test("handles bimonthly interval", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			intervalCount: 2,
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true); // Jan (start)
		expect(isPaymentOnDate(sub, new Date(2024, 1, 15))).toBe(false); // Feb (skip)
		expect(isPaymentOnDate(sub, new Date(2024, 2, 15))).toBe(true); // Mar
		expect(isPaymentOnDate(sub, new Date(2024, 3, 15))).toBe(false); // Apr (skip)
	});
});

describe("isPaymentOnDate — weekly", () => {
	test("payment on start date", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "week",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
	});

	test("payment exactly one week later", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "week",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 22))).toBe(true);
	});

	test("no payment on non-week day", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "week",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 18))).toBe(false);
	});

	test("handles biweekly interval", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "week",
			intervalCount: 2,
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true); // Start
		expect(isPaymentOnDate(sub, new Date(2024, 0, 22))).toBe(false); // 1 week
		expect(isPaymentOnDate(sub, new Date(2024, 0, 29))).toBe(true); // 2 weeks
	});
});

describe("isPaymentOnDate — daily", () => {
	test("payment every day", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "day",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2024, 0, 16))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2024, 0, 17))).toBe(true);
	});

	test("every 3 days", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "day",
			intervalCount: 3,
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2024, 0, 16))).toBe(false);
		expect(isPaymentOnDate(sub, new Date(2024, 0, 17))).toBe(false);
		expect(isPaymentOnDate(sub, new Date(2024, 0, 18))).toBe(true);
	});
});

describe("isPaymentOnDate — yearly", () => {
	test("payment on anniversary", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "year",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2025, 0, 15))).toBe(true);
	});

	test("no payment on same day different month", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "year",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 5, 15))).toBe(false);
	});

	test("handles biennial interval", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			interval: "year",
			intervalCount: 2,
		});
		expect(isPaymentOnDate(sub, new Date(2024, 0, 15))).toBe(true);
		expect(isPaymentOnDate(sub, new Date(2025, 0, 15))).toBe(false);
		expect(isPaymentOnDate(sub, new Date(2026, 0, 15))).toBe(true);
	});

	test("handles leap day start (Feb 29) on non-leap year", () => {
		const sub = makeSub({
			startedAt: "2024-02-29T00:00:00.000Z",
			interval: "year",
		});
		// 2025 is not a leap year, Feb has 28 days
		expect(isPaymentOnDate(sub, new Date(2025, 1, 28))).toBe(true);
	});
});

describe("isPaymentOnDate — status and endsAt", () => {
	test("no payment after endsAt", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			endsAt: "2024-06-15T00:00:00.000Z",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 6, 15))).toBe(false);
	});

	test("payment on endsAt date", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			endsAt: "2024-06-15T00:00:00.000Z",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 5, 15))).toBe(true);
	});

	test("cancelled without endsAt returns false", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			status: "cancelled",
			endsAt: null,
		});
		expect(isPaymentOnDate(sub, new Date(2024, 1, 15))).toBe(false);
	});

	test("cancelled with endsAt still shows payments before endsAt", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			status: "cancelled",
			endsAt: "2024-06-15T00:00:00.000Z",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 2, 15))).toBe(true);
	});

	test("paused subscription still shows payments", () => {
		const sub = makeSub({
			startedAt: "2024-01-15T00:00:00.000Z",
			status: "paused",
		});
		expect(isPaymentOnDate(sub, new Date(2024, 1, 15))).toBe(true);
	});
});

describe("getSubscriptionsByDay", () => {
	test("groups subscriptions by payment date", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		const map = getSubscriptionsByDay([sub], 2024, 0);
		expect(map.get("2024-01-15")).toHaveLength(1);
	});

	test("includes multiple subscriptions on same day", () => {
		const sub1 = makeSub({
			id: "1",
			startedAt: "2024-01-15T00:00:00.000Z",
		});
		const sub2 = makeSub({
			id: "2",
			startedAt: "2024-01-15T00:00:00.000Z",
		});
		const map = getSubscriptionsByDay([sub1, sub2], 2024, 0);
		expect(map.get("2024-01-15")).toHaveLength(2);
	});

	test("returns empty map for no subscriptions", () => {
		const map = getSubscriptionsByDay([], 2024, 0);
		expect(map.size).toBe(0);
	});

	test("does not include dates with no payments", () => {
		const sub = makeSub({ startedAt: "2024-01-15T00:00:00.000Z" });
		const map = getSubscriptionsByDay([sub], 2024, 0);
		expect(map.has("2024-01-14")).toBe(false);
	});
});

describe("formatCurrency", () => {
	test("formats USD by default", () => {
		const result = formatCurrency(9.99);
		expect(result).toBe("$9.99");
	});

	test("formats EUR", () => {
		const result = formatCurrency(9.99, "EUR");
		expect(result).toContain("9.99");
	});

	test("formats zero", () => {
		const result = formatCurrency(0);
		expect(result).toBe("$0.00");
	});

	test("formats large numbers", () => {
		const result = formatCurrency(1234.56);
		expect(result).toBe("$1,234.56");
	});

	test("formats negative numbers", () => {
		const result = formatCurrency(-5.99);
		expect(result).toContain("5.99");
	});
});
