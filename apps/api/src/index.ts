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
  tracesSampleRate: 1.0,
});

const app = new Hono<AppEnv>()
	.basePath("/api")
	.use("*", logger())
	.use(
		"*",
		cors({
			origin: "http://localhost:5173",
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
	.route("/currencies", currenciesApp);

export type AppType = typeof app;
export default app;
