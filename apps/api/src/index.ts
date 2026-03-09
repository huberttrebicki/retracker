import * as Sentry from "@sentry/bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { AppEnv } from "./lib/auth";
import authApp from "./routes/auth";
import providersApp from "./routes/providers";
import subscriptionsApp from "./routes/subscriptions";
import currenciesApp from "./routes/currencies";

Sentry.init({
  dsn: process.env.SENTRY_DSN!,
  tracesSampleRate: 0.2,
});

const app = new Hono<AppEnv>()
	.basePath("/api")
	.use("*", logger())
	.use(
		"*",
		cors({
			origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["POST", "GET", "PATCH", "DELETE", "PUT", "OPTIONS"],
			exposeHeaders: ["Content-Length"],
			maxAge: 600,
			credentials: true,
		}),
	)
  .route("/", authApp)
	.route("/providers", providersApp)
	.route("/subscriptions", subscriptionsApp)
	.route("/currencies", currenciesApp)
	.onError((err, c) => {
		Sentry.captureException(err);
		return c.json({ error: "Internal server error" }, 500);
	});

export type AppType = typeof app;
export default {
	fetch: app.fetch,
	port: process.env.PORT ?? 3000,
	hostname: "0.0.0.0",
};
