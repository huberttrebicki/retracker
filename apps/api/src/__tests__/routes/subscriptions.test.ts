import { describe, test, expect } from "bun:test";
import z from "zod";

const subscriptionSchema = z.object({
	name: z.string().nonempty(),
	providerId: z.uuidv7(),
	currencyId: z.uuidv7(),
	description: z.string().nullable(),
	startedAt: z.coerce.date(),
	intervalCount: z.number().positive(),
	interval: z.enum(["day", "week", "month", "year"]),
	price: z.number().positive(),
	metadata: z.json().default({}),
	status: z.enum(["active", "paused", "cancelled"]).default("active"),
	endsAt: z.coerce.date().nullable().default(null),
});

describe("subscription schema validation", () => {
	const validInput = {
		name: "Netflix",
		providerId: Bun.randomUUIDv7(),
		currencyId: Bun.randomUUIDv7(),
		description: "Streaming service",
		startedAt: "2024-01-15",
		intervalCount: 1,
		interval: "month" as const,
		price: 15.99,
		metadata: {},
	};

	test("accepts valid subscription data", () => {
		const result = subscriptionSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	test("defaults status to active", () => {
		const result = subscriptionSchema.parse(validInput);
		expect(result.status).toBe("active");
	});

	test("defaults endsAt to null", () => {
		const result = subscriptionSchema.parse(validInput);
		expect(result.endsAt).toBeNull();
	});

	test("coerces startedAt string to Date", () => {
		const result = subscriptionSchema.parse(validInput);
		expect(result.startedAt).toBeInstanceOf(Date);
	});

	test("rejects empty name", () => {
		const result = subscriptionSchema.safeParse({ ...validInput, name: "" });
		expect(result.success).toBe(false);
	});

	test("rejects negative price", () => {
		const result = subscriptionSchema.safeParse({ ...validInput, price: -5 });
		expect(result.success).toBe(false);
	});

	test("rejects zero price", () => {
		const result = subscriptionSchema.safeParse({ ...validInput, price: 0 });
		expect(result.success).toBe(false);
	});

	test("rejects zero intervalCount", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			intervalCount: 0,
		});
		expect(result.success).toBe(false);
	});

	test("rejects negative intervalCount", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			intervalCount: -1,
		});
		expect(result.success).toBe(false);
	});

	test("rejects invalid interval", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			interval: "quarterly",
		});
		expect(result.success).toBe(false);
	});

	test("accepts all valid intervals", () => {
		for (const interval of ["day", "week", "month", "year"]) {
			const result = subscriptionSchema.safeParse({
				...validInput,
				interval,
			});
			expect(result.success).toBe(true);
		}
	});

	test("accepts all valid statuses", () => {
		for (const status of ["active", "paused", "cancelled"]) {
			const result = subscriptionSchema.safeParse({
				...validInput,
				status,
			});
			expect(result.success).toBe(true);
		}
	});

	test("rejects invalid status", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			status: "expired",
		});
		expect(result.success).toBe(false);
	});

	test("rejects invalid providerId format", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			providerId: "not-a-uuid",
		});
		expect(result.success).toBe(false);
	});

	test("accepts nullable description", () => {
		const result = subscriptionSchema.safeParse({
			...validInput,
			description: null,
		});
		expect(result.success).toBe(true);
	});

	test("partial schema allows partial updates", () => {
		const partial = subscriptionSchema.partial();
		const result = partial.safeParse({ name: "Updated Name" });
		expect(result.success).toBe(true);
	});

	test("partial schema rejects invalid field values", () => {
		const partial = subscriptionSchema.partial();
		const result = partial.safeParse({ price: -10 });
		expect(result.success).toBe(false);
	});

	test("coerces endsAt string to Date", () => {
		const result = subscriptionSchema.parse({
			...validInput,
			endsAt: "2025-12-31",
		});
		expect(result.endsAt).toBeInstanceOf(Date);
	});
});
