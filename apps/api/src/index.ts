import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./lib/auth";
import authApp from "./routes/auth";
import providersApp from "./routes/providers";
import subscriptionsApp from "./routes/subscriptions";

const app = new Hono<AppEnv>()
  .use(
    "*",
    cors({
		origin: "http://localhost:5173",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}))
  .route("/", authApp)
  .route("/providers", providersApp)
  .route("/subscriptions", subscriptionsApp);

export type AppType = typeof app;
export default app;
