import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { db } from "../database/db";
import { providerCategories, providers } from "../database/schema";
import { eq, isNull, or } from "drizzle-orm";

import type { AppEnv } from "../lib/auth";
import { requireAuth } from "../middleware/auth";

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
    return c.json(providersQuery);
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
      const param = c.req.valid("param");
      const id = param.id;
      const values = c.req.valid("json");
      const user = c.get("user")!;
      const [creatorId] = await db
        .select({ id: providers.id })
        .from(providers)
        .where(eq(providers.id, id))
        .limit(1);

      if (!creatorId)
        return c.json("provider with given id does not exist", 404);

      if (creatorId.id !== user.id)
        return c.json("You have no permission to access this content", 403);

      await db.update(providers).set(values).where(eq(providers.id, id));
      c.status(204);
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.uuidv7() })),
    async (c) => {
      const param = c.req.valid("param");
      const id = param.id;
      const user = c.get("user")!;
      const [creatorId] = await db
        .select({ id: providers.id })
        .from(providers)
        .where(eq(providers.id, id))
        .limit(1);

      if (!creatorId)
        return c.json("provider with given id does not exist", 404);

      if (creatorId.id !== user.id)
        return c.json("You have no permission to access this content", 403);

      await db.delete(providers).where(eq(providers.id, id));
      c.status(204);
    },
  );

export default providersApp;
