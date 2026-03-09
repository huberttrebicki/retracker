import { describe, test, expect, setSystemTime, afterAll } from "bun:test";
import { formatTimeLeft } from "../../lib/format-time-left";

describe("formatTimeLeft", () => {
	afterAll(() => {
		setSystemTime();
	});

	test("returns 'Expired' for past date", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-05-01T00:00:00.000Z")).toBe("Expired");
	});

	test("returns 'Less than a day left' for same-day expiry", () => {
		setSystemTime(new Date("2024-06-01T12:00:00.000Z"));
		expect(formatTimeLeft("2024-06-01T18:00:00.000Z")).toBe(
			"Less than a day left",
		);
	});

	test("returns days left for short durations", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-06-06T00:00:00.000Z")).toBe("5 days left");
	});

	test("returns '1 days left' for exactly 1 day", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-06-02T12:00:00.000Z")).toBe("1 days left");
	});

	test("returns '30 days left' for exactly 30 days", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-07-01T00:00:00.000Z")).toBe("30 days left");
	});

	test("returns months and days for longer durations", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-08-15T00:00:00.000Z")).toBe(
			"2 months 15 days left",
		);
	});

	test("returns months only when no remaining days", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-08-01T00:00:00.000Z")).toBe(
			"2 months 1 days left",
		);
	});

	test("returns exact months when divisible by 30", () => {
		setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
		expect(formatTimeLeft("2024-07-31T00:00:00.000Z")).toBe("2 months left");
	});

	test("returns 'Expired' for current time", () => {
		setSystemTime(new Date("2024-06-01T12:00:00.000Z"));
		expect(formatTimeLeft("2024-06-01T12:00:00.000Z")).toBe("Expired");
	});
});
