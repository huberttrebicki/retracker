import { describe, test, expect } from "bun:test";
import { Hono } from "hono";
import { requireAuth, requireVerified } from "../../middleware/auth";
import type { AppEnv } from "../../lib/auth";

function createTestApp() {
	const app = new Hono<AppEnv>();

	// Auth route
	app.use("/auth-required/*", requireAuth);
	app.get("/auth-required/test", (c) => c.json({ ok: true }));

	// Verified route
	app.use("/verified-required/*", (c, next) => {
		// Set user/session first so requireAuth would pass
		c.set("user", { id: "1", email: "test@test.com", emailVerified: false } as any);
		c.set("session", { id: "s1" } as any);
		return next();
	});
	app.use("/verified-required/*", requireVerified);
	app.get("/verified-required/test", (c) => c.json({ ok: true }));

	// Verified user route
	app.use("/verified-user/*", (c, next) => {
		c.set("user", { id: "1", email: "test@test.com", emailVerified: true } as any);
		c.set("session", { id: "s1" } as any);
		return next();
	});
	app.use("/verified-user/*", requireVerified);
	app.get("/verified-user/test", (c) => c.json({ ok: true }));

	return app;
}

describe("requireAuth middleware", () => {
	test("returns 401 when no session or user is set", async () => {
		const app = createTestApp();
		const res = await app.request("/auth-required/test");
		expect(res.status).toBe(401);
		const body = await res.json();
		expect(body.error).toBe("Unauthorized");
	});
});

describe("requireVerified middleware", () => {
	test("returns 403 when email is not verified", async () => {
		const app = createTestApp();
		const res = await app.request("/verified-required/test");
		expect(res.status).toBe(403);
		const body = await res.json();
		expect(body.error).toBe("Email not verified");
	});

	test("passes when email is verified", async () => {
		const app = createTestApp();
		const res = await app.request("/verified-user/test");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.ok).toBe(true);
	});
});
