import { describe, test, expect } from "bun:test";
import z from "zod";

const querySchema = z.object({
	base: z.string().length(3).default("USD"),
});

describe("currencies query validation", () => {
	test("defaults base to USD", () => {
		const result = querySchema.parse({});
		expect(result.base).toBe("USD");
	});

	test("accepts valid 3-letter currency code", () => {
		const result = querySchema.safeParse({ base: "EUR" });
		expect(result.success).toBe(true);
		expect(result.data?.base).toBe("EUR");
	});

	test("rejects currency code that is too short", () => {
		const result = querySchema.safeParse({ base: "US" });
		expect(result.success).toBe(false);
	});

	test("rejects currency code that is too long", () => {
		const result = querySchema.safeParse({ base: "USDD" });
		expect(result.success).toBe(false);
	});

	test("accepts lowercase currency codes", () => {
		const result = querySchema.safeParse({ base: "eur" });
		expect(result.success).toBe(true);
	});
});
