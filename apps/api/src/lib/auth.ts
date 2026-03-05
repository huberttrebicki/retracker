import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database/db";
import * as schema from "../database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
      enabled: true,
  },
  trustedOrigins: ["http://localhost:5173"],
  advanced: {
    database: {
      generateId: () => Bun.randomUUIDv7(),
    },
  },
});

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};
