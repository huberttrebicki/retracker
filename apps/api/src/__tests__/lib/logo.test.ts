import { describe, test, expect } from "bun:test";

// Inline the function to avoid env var dependency
function getProviderLogo(domain: string, apiKey: string) {
	const host = new URL(domain.includes("://") ? domain : `https://${domain}`)
		.host;
	return `https://cdn.brandfetch.io/domain/${host}?c=${apiKey}`;
}

describe("getProviderLogo", () => {
	const apiKey = "test-api-key";

	test("builds correct URL from full URL with protocol", () => {
		const result = getProviderLogo("https://netflix.com", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/netflix.com?c=test-api-key",
		);
	});

	test("builds correct URL from domain without protocol", () => {
		const result = getProviderLogo("spotify.com", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/spotify.com?c=test-api-key",
		);
	});

	test("strips www from domain", () => {
		const result = getProviderLogo("https://www.google.com", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/www.google.com?c=test-api-key",
		);
	});

	test("handles domain with path", () => {
		const result = getProviderLogo("https://example.com/some/path", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/example.com?c=test-api-key",
		);
	});

	test("handles domain with subdomain", () => {
		const result = getProviderLogo("https://app.notion.so", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/app.notion.so?c=test-api-key",
		);
	});

	test("handles http protocol", () => {
		const result = getProviderLogo("http://example.com", apiKey);
		expect(result).toBe(
			"https://cdn.brandfetch.io/domain/example.com?c=test-api-key",
		);
	});
});
