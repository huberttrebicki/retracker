import { Hono } from "hono";
import { db } from "../database/db";
import { currencies } from "../database/schema";
import type { AppEnv } from "../lib/auth";
import { requireAuth } from "../middleware/auth";

const currenciesApp = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const result = await db
      .select({
        id: currencies.id,
        name: currencies.name,
        code: currencies.code,
      })
      .from(currencies);
    return c.json(result);
  });

export default currenciesApp;
