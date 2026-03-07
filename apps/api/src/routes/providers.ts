import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { db } from "../database/db";
import { providerCategories, providers } from "../database/schema";
import { eq, isNull, or } from "drizzle-orm";

import type { AppEnv } from "../lib/auth";
import { requireAuth } from "../middleware/auth";
import { getProviderLogo } from "../lib/logo";

const providerSchema = z.object({
  name: z.string().nonempty(),
  providerCategoryId: z.uuidv7(),
  website: z.string().nullable(),
  mail: z.string().nullable(),
  phone: z.string().nullable(),
});

const providersApp = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => {
    const user = c.get("user")!;
    const providersQuery = await db
      .select({
        id: providers.id,
        userId: providers.userId,
        category: providerCategories.name,
        name: providers.name,
        website: providers.website,
        mail: providers.mail,
        phone: providers.phone,
      })
      .from(providers)
      .innerJoin(
        providerCategories,
        eq(providerCategories.id, providers.providerCategoryId),
      )
      .where(or(isNull(providers.userId), eq(providers.userId, user.id)));
    return c.json(providersQuery.map(({ userId, ...p }) => ({
      ...p,
      logo: !userId && p.website ? getProviderLogo(p.website) : null,
    })));
  })
  .get("/user-providers", async (c) => {
    const user = c.get("user")!;
    const providersQuery = await db
      .select({
        id: providers.id,
        providerCategoryId: providers.providerCategoryId,
        category: providerCategories.name,
        name: providers.name,
        website: providers.website,
        mail: providers.mail,
        phone: providers.phone,
      })
      .from(providers)
      .innerJoin(
        providerCategories,
        eq(providerCategories.id, providers.providerCategoryId),
      )
      .where(eq(providers.userId, user.id));
    return c.json(providersQuery.map((p) => ({
      ...p,
      logo: null,
    })));
  })
  .get("/categories", async (c) => {
    const categories = await db
      .select({
        id: providerCategories.id,
        name: providerCategories.name,
      })
      .from(providerCategories);
    return c.json(categories);
  })
  .post("/", zValidator("json", providerSchema), async (c) => {
    const user = c.get("user")!;
    const { name, providerCategoryId, website, mail, phone } =
      c.req.valid("json");
    const id = Bun.randomUUIDv7();

    await db.insert(providers).values({
      id: id,
      providerCategoryId: providerCategoryId,
      userId: user.id,
      name: name,
      website: website,
      mail: mail,
      phone: phone,
    });
    return c.json({ id }, 201);
  })
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.uuidv7() })),
    zValidator(
      "json",
      providerSchema.partial().refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");
      const user = c.get("user")!;
      const [provider] = await db
        .select({ userId: providers.userId })
        .from(providers)
        .where(eq(providers.id, id))
        .limit(1);

      if (!provider)
        return c.json("provider with given id does not exist", 404);

      if (provider.userId !== user.id)
        return c.json("You have no permission to access this content", 403);

      await db.update(providers).set(values).where(eq(providers.id, id));
      return c.body(null, 204);
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.uuidv7() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const user = c.get("user")!;
      const [provider] = await db
        .select({ userId: providers.userId })
        .from(providers)
        .where(eq(providers.id, id))
        .limit(1);

      if (!provider)
        return c.json("provider with given id does not exist", 404);

      if (provider.userId !== user.id)
        return c.json("You have no permission to access this content", 403);

      await db.delete(providers).where(eq(providers.id, id));
      return c.body(null, 204);
    },
  );

export default providersApp;
