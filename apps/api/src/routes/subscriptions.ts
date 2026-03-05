import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../database/db";
import { AppEnv } from "../lib/auth";
import { requireAuth } from "../middleware/auth";
import { currencies, providerCategories, providers, subscriptions } from "../database/schema";
import { eq, sql } from "drizzle-orm";

const subscriptionsApp = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const user = c.get("user")!;
    const subs = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        provider: sql`json_build_object('id', ${providers.id}, 'name', ${providers.name}, 'website', ${providers.website}, 'category', ${providerCategories.name})`,
        currency: currencies.code,
        startedAt: subscriptions.startedAt,
        intervalCount: subscriptions.intervalCount,
        interval: subscriptions.interval,
        price: subscriptions.price,
        endsAt: subscriptions.endsAt,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .innerJoin(providers, eq(subscriptions.providerId, providers.id))
      .innerJoin(providerCategories, eq(providers.providerCategoryId, providerCategories.id))
      .innerJoin(currencies, eq(subscriptions.currencyId, currencies.id))
      .where(eq(subscriptions.userId, user.id));
    return c.json(subs);
  })
  .get("/:id", zValidator("param", z.object({ id: z.uuidv7() })), async (c) => {
    const param = c.req.valid("param");
    const user = c.get("user")!;
    const [sub] = await db.select({
      id: subscriptions.id,
      name: subscriptions.name,
      description: subscriptions.description,
      metadata: subscriptions.metadata,
      userId: subscriptions.userId,
      provider: sql`json_build_object('id', ${providers.id}, 'name', ${providers.name}, 'website', ${providers.website}, 'mail', ${providers.mail}, 'phone', ${providers.phone}, 'category', ${providerCategories.name})`,
      currency: currencies.code,
      startedAt: subscriptions.startedAt,
      intervalCount: subscriptions.intervalCount,
      interval: subscriptions.interval,
      price: subscriptions.price,
      endsAt: subscriptions.endsAt,
      status: subscriptions.status,
    })
      .from(subscriptions).
      innerJoin(providers, eq(subscriptions.providerId, providers.id))
      .innerJoin(providerCategories, eq(providers.providerCategoryId, providerCategories.id))
      .innerJoin(currencies, eq(subscriptions.currencyId, currencies.id))
      .where(eq(subscriptions.id, param.id)).limit(1);

    if (!sub) {
      return c.json(`Subscription with id: ${param.id} does not exist`);
    }

    if (sub.userId !== user.id) {
      return c.json("Content does not belong to the user", 403);
    }

    return c.json(sub);
  })
  .delete("/:id", zValidator("param", z.object({ id: z.uuidv7() })), async (c) => {
    const param = c.req.valid("param");
    const user = c.get("user")!;
    const [sub] = await db.select({ userId: subscriptions.userId }).from(subscriptions).where(eq(subscriptions.id, param.id)).limit(1);
    if (sub.userId !== user.id) {
      return c.json("Content does not belong to the user", 403);
    }
    await db.delete(subscriptions).where(eq(subscriptions.id, param.id));
    c.status(204);
  });


export default subscriptionsApp
