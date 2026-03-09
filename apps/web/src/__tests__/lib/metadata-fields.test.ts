import { describe, test, expect } from "bun:test";
import { CATEGORY_METADATA_FIELDS } from "../../lib/metadata-fields";

describe("CATEGORY_METADATA_FIELDS", () => {
	test("is defined as an object", () => {
		expect(typeof CATEGORY_METADATA_FIELDS).toBe("object");
	});

	test("has expected categories", () => {
		const keys = Object.keys(CATEGORY_METADATA_FIELDS);
		expect(keys).toContain("Streaming & Video Entertainment");
		expect(keys).toContain("Music & Audio");
		expect(keys).toContain("Cloud Storage & Backup");
		expect(keys).toContain("Internet & Telecom");
		expect(keys).toContain("Developer Tools & Hosting");
		expect(keys).toContain("AI & Machine Learning");
	});

	test("each category has fields with key and label", () => {
		for (const [, fields] of Object.entries(CATEGORY_METADATA_FIELDS)) {
			expect(Array.isArray(fields)).toBe(true);
			for (const field of fields) {
				expect(typeof field.key).toBe("string");
				expect(typeof field.label).toBe("string");
				expect(field.key.length).toBeGreaterThan(0);
				expect(field.label.length).toBeGreaterThan(0);
			}
		}
	});

	test("Internet & Telecom has phoneNumber and plan fields", () => {
		const fields = CATEGORY_METADATA_FIELDS["Internet & Telecom"];
		const keys = fields.map((f) => f.key);
		expect(keys).toContain("phoneNumber");
		expect(keys).toContain("plan");
	});

	test("Live Streaming category has channelName field", () => {
		const fields =
			CATEGORY_METADATA_FIELDS["Live Streaming & Creator Support"];
		const keys = fields.map((f) => f.key);
		expect(keys).toContain("channelName");
	});

	test("field keys are valid identifier strings", () => {
		for (const [, fields] of Object.entries(CATEGORY_METADATA_FIELDS)) {
			for (const field of fields) {
				expect(field.key).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
			}
		}
	});
});
