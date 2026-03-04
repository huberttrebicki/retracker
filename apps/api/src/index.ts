import { Hono } from "hono";
import type { AppEnv } from "./lib/auth";
import authApp from "./routes/auth";
import providersApp from "./routes/providers";
import { requireAuth } from "./middleware/auth";

const app = new Hono<AppEnv>()
  .route("/", authApp)
  .use("*", requireAuth) // has to be after the better auth route definition!
  .route("/providers", providersApp);

export default app;
