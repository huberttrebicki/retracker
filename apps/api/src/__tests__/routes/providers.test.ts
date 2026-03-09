import { describe, test, expect } from "bun:test";
import z from "zod";

const providerSchema = z.object({
	name: z.string().nonempty(),
	providerCategoryId: z.uuidv7(),
	website: z.string().nullable(),
	mail: z.string().nullable(),
	phone: z.string().nullable(),
});

describe("provider schema validation", () => {
	const validInput = {
		name: "Acme Corp",
		providerCategoryId: Bun.randomUUIDv7(),
		website: "https://acme.com",
		mail: "support@acme.com",
		phone: "+1234567890",
	};

	test("accepts valid provider data", () => {
		const result = providerSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	test("rejects empty name", () => {
		const result = providerSchema.safeParse({ ...validInput, name: "" });
		expect(result.success).toBe(false);
	});

	test("accepts null website", () => {
		const result = providerSchema.safeParse({ ...validInput, website: null });
		expect(result.success).toBe(true);
	});

	test("accepts null mail", () => {
		const result = providerSchema.safeParse({ ...validInput, mail: null });
		expect(result.success).toBe(true);
	});

	test("accepts null phone", () => {
		const result = providerSchema.safeParse({ ...validInput, phone: null });
		expect(result.success).toBe(true);
	});

	test("accepts all nullable fields as null", () => {
		const result = providerSchema.safeParse({
			name: "Minimal Provider",
			providerCategoryId: Bun.randomUUIDv7(),
			website: null,
			mail: null,
			phone: null,
		});
		expect(result.success).toBe(true);
	});

	test("rejects invalid providerCategoryId format", () => {
		const result = providerSchema.safeParse({
			...validInput,
			providerCategoryId: "invalid-uuid",
		});
		expect(result.success).toBe(false);
	});

	test("rejects missing name", () => {
		const { name, ...withoutName } = validInput;
		const result = providerSchema.safeParse(withoutName);
		expect(result.success).toBe(false);
	});

	test("partial schema requires at least one field", () => {
		const partial = providerSchema.partial().refine(
			(data) => Object.keys(data).length > 0,
			{ message: "At least one field must be provided for update" },
		);
		const result = partial.safeParse({});
		expect(result.success).toBe(false);
	});

	test("partial schema accepts single field update", () => {
		const partial = providerSchema.partial().refine(
			(data) => Object.keys(data).length > 0,
			{ message: "At least one field must be provided for update" },
		);
		const result = partial.safeParse({ name: "New Name" });
		expect(result.success).toBe(true);
	});
});
