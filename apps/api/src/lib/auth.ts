import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { sendAccountVerificationEmail, sendResetPasswordEmail } from "./email";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			void sendResetPasswordEmail(user.email, url);
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, request) => {
			void sendAccountVerificationEmail(user.email, url);
		},
		sendOnSignUp: true,
	},
	trustedOrigins: [process.env.CORS_ORIGIN ?? "http://localhost:5173"],
	advanced: {
		database: {
			generateId: () => Bun.randomUUIDv7(),
		},
	},
	user: {
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				const userId = user.id;
				await db.transaction(async (tx) => {
					await tx
						.delete(schema.subscriptions)
						.where(eq(schema.subscriptions.userId, userId));
					await tx
						.delete(schema.providers)
						.where(eq(schema.providers.userId, userId));
				});
			},
		},
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  }
});

export type AppEnv = {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
};
