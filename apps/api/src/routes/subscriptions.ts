import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../database/db";
import type { AppEnv } from "../lib/auth";
import { requireAuth, requireVerified } from "../middleware/auth";
import {
	currencies,
	providerCategories,
	providers,
	subscriptions,
} from "../database/schema";
import { eq, sql } from "drizzle-orm";
import { getProviderLogo } from "../lib/logo";

const subscriptionSchema = z.object({
	name: z.string().nonempty(),
	providerId: z.uuidv7(),
	currencyId: z.uuidv7(),
	description: z.string().nullable(),
	startedAt: z.coerce.date(),
	intervalCount: z.number().positive(),
	interval: z.enum(["day", "week", "month", "year"]),
	price: z.number().positive(),
	metadata: z.json().default({}),
	status: z.enum(["active", "paused", "cancelled"]),
	endsAt: z.coerce.date().nullable(),
});

const subscriptionsApp = new Hono<AppEnv>()
	.use("*", requireAuth)
	.get("/", async (c) => {
		const user = c.get("user")!;
		const subs = await db
			.select({
				id: subscriptions.id,
				name: subscriptions.name,
				description: subscriptions.description,
				provider: sql`json_build_object('id', ${providers.id}, 'name', ${providers.name}, 'website', ${providers.website}, 'userId', ${providers.userId}, 'category', ${providerCategories.name})`,
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
			.innerJoin(
				providerCategories,
				eq(providers.providerCategoryId, providerCategories.id),
			)
			.innerJoin(currencies, eq(subscriptions.currencyId, currencies.id))
			.where(eq(subscriptions.userId, user.id));
		return c.json(
			subs.map((s: any) => {
				const { userId, ...provider } = s.provider;
				return {
					...s,
					provider: {
						...provider,
						logo:
							!userId && provider.website
								? getProviderLogo(provider.website)
								: null,
					},
				};
			}),
		);
	})
	.get("/:id", zValidator("param", z.object({ id: z.uuidv7() })), async (c) => {
		const { id } = c.req.valid("param");
		const user = c.get("user")!;
		const [sub] = await db
			.select({
				id: subscriptions.id,
				name: subscriptions.name,
				description: subscriptions.description,
				metadata: subscriptions.metadata,
				userId: subscriptions.userId,
				provider: sql`json_build_object('id', ${providers.id}, 'name', ${providers.name}, 'website', ${providers.website}, 'mail', ${providers.mail}, 'phone', ${providers.phone}, 'userId', ${providers.userId}, 'category', ${providerCategories.name})`,
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
			.innerJoin(
				providerCategories,
				eq(providers.providerCategoryId, providerCategories.id),
			)
			.innerJoin(currencies, eq(subscriptions.currencyId, currencies.id))
			.where(eq(subscriptions.id, id))
			.limit(1);

		if (!sub) {
			return c.json(`Subscription with id: ${id} does not exist`);
		}

		if (sub.userId !== user.id) {
			return c.json("Content does not belong to the user", 403);
		}

		const { userId: providerUserId, ...provider } = (sub as any).provider;
		return c.json({
			...sub,
			provider: {
				...provider,
				logo:
					!providerUserId && provider.website
						? getProviderLogo(provider.website)
						: null,
			},
		});
	})
	.post(
		"/",
		requireVerified,
		zValidator("json", subscriptionSchema),
		async (c) => {
			const body = c.req.valid("json");
			const user = c.get("user")!;
			const id = Bun.randomUUIDv7();

			await db.insert(subscriptions).values({
				id,
				userId: user.id,
				name: body.name,
				providerId: body.providerId,
				currencyId: body.currencyId,
				description: body.description,
				startedAt: body.startedAt,
				intervalCount: body.intervalCount,
				interval: body.interval,
				price: String(body.price),
				metadata: body.metadata,
				status: "active",
			});

			return c.json({ id }, 201);
		},
	)
	.patch(
		"/:id",
		zValidator("param", z.object({ id: z.uuidv7() })),
		zValidator("json", subscriptionSchema.partial()),
		async (c) => {
			const { id } = c.req.valid("param");
			const body = c.req.valid("json");
			const user = c.get("user")!;

			const [sub] = await db
				.select({ userId: subscriptions.userId })
				.from(subscriptions)
				.where(eq(subscriptions.id, id))
				.limit(1);

			if (!sub) {
				return c.json(`Subscription with id: ${id} does not exist`, 404);
			}

			if (sub.userId !== user.id) {
				return c.json("Content does not belong to the user", 403);
			}

			await db
				.update(subscriptions)
				.set({
					...body,
					price: body.price !== undefined ? String(body.price) : undefined,
				})
				.where(eq(subscriptions.id, id));

			return c.body(null, 204);
		},
	)
	.delete(
		"/:id",
		zValidator("param", z.object({ id: z.uuidv7() })),
		async (c) => {
			const { id } = c.req.valid("param");
			const user = c.get("user")!;
			const [sub] = await db
				.select({ userId: subscriptions.userId })
				.from(subscriptions)
				.where(eq(subscriptions.id, id))
				.limit(1);
			if (sub.userId !== user.id) {
				return c.json("Content does not belong to the user", 403);
			}
			await db.delete(subscriptions).where(eq(subscriptions.id, id));
			return c.body(null, 204);
		},
	);

export default subscriptionsApp;
