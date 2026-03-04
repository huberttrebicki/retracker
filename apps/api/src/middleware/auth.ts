import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../lib/auth";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) return c.json({ error: "Unauthorized" }, 401);

  return next();
});
