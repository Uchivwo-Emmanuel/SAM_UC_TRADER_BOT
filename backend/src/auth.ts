import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { accounts, sessions, users, verifications } from "./schema.js";
import { config } from "./config.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications }
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: (config.BETTER_AUTH_TRUSTED_ORIGINS ?? config.CORS_ORIGIN).split(",").map((origin) => origin.trim()).filter(Boolean),
  advanced: { defaultCookieAttributes: { secure: config.NODE_ENV === "production", sameSite: "lax" } }
});
