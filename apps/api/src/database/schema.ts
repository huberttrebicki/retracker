import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	pgEnum,
	char,
	integer,
	numeric,
	jsonb,
	check,
	uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const intervalEnum = pgEnum("billing_interval", [
	"day",
	"week",
	"month",
	"year",
]);

export const statusEnum = pgEnum("status", ["active", "paused", "cancelled"]);

export const user = pgTable("user", {
	id: uuid("id").primaryKey().default(sql`uuidv7()`),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const session = pgTable(
	"session",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const providerCategories = pgTable("provider_categories", {
	id: uuid("id").primaryKey().default(sql`uuidv7()`),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const currencies = pgTable("currencies", {
	id: uuid("id").primaryKey().default(sql`uuidv7()`),
	name: text("name").notNull(),
	code: char("code", { length: 3 }).unique().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const providers = pgTable(
	"providers",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		providerCategoryId: uuid("provider_category_id")
			.notNull()
			.references(() => providerCategories.id),
		userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		website: text("website"),
		mail: text("mail"),
		phone: text("phone"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("providers_provider_category_id_idx").on(table.providerCategoryId),
		index("providers_user_id_idx").on(table.userId),
	],
);

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		providerId: uuid("provider_id")
			.references(() => providers.id)
			.notNull(),
		currencyId: uuid("currency_id")
			.references(() => currencies.id)
			.notNull(),
		name: text("name").notNull(),
		description: text("description"),
		startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
		intervalCount: integer("interval_count").notNull(),
		interval: intervalEnum("billing_interval").notNull(),
		price: numeric("price").notNull(),
		metadata: jsonb("metadata").notNull(),
		endsAt: timestamp("ends_at", { withTimezone: true }),
		status: statusEnum().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("subscriptions_user_id_idx").on(table.userId),
		index("subscriptions_provider_id_idx").on(table.providerId),
		index("subscriptions_currency_id_idx").on(table.currencyId),
		check("interval_count_check", sql`${table.intervalCount} >= 1`),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	providers: many(providers),
	subscriptions: many(subscriptions),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const providerCategoriesRelations = relations(
	providerCategories,
	({ many }) => ({
		providers: many(providers),
	}),
);

export const currenciesRelations = relations(currencies, ({ many }) => ({
	subscriptions: many(subscriptions),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
	providerCategory: one(providerCategories, {
		fields: [providers.providerCategoryId],
		references: [providerCategories.id],
	}),
	user: one(user, {
		fields: [providers.userId],
		references: [user.id],
	}),
	subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(user, {
		fields: [subscriptions.userId],
		references: [user.id],
	}),
	provider: one(providers, {
		fields: [subscriptions.providerId],
		references: [providers.id],
	}),
	currency: one(currencies, {
		fields: [subscriptions.currencyId],
		references: [currencies.id],
	}),
}));
