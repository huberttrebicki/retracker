import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { db } from "../database/db";
import { currencies } from "../database/schema";
import type { AppEnv } from "../lib/auth";
import { requireAuth } from "../middleware/auth";

let ratesCache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000;

async function getExchangeRates(base: string): Promise<Record<string, number>> {
  if (ratesCache && ratesCache.rates[base] !== undefined && Date.now() - ratesCache.fetchedAt < CACHE_TTL) {
    return ratesCache.rates;
  }
  const key = process.env.EXCHANGE_RATE_API_KEY!;
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/${base}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = (await res.json()) as { result: string; base_code: string; conversion_rates: Record<string, number> };
  if (data.result !== "success") throw new Error("Failed to fetch exchange rates");
  const rates = data.conversion_rates;
  ratesCache = { rates, fetchedAt: Date.now() };
  return rates;
}

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
  })
  .get("/rates", zValidator("query", z.object({ base: z.string().length(3).default("USD") })), async (c) => {
    const { base } = c.req.valid("query");
    const rates = await getExchangeRates(base.toUpperCase());
    return c.json(rates);
  });

export default currenciesApp;
