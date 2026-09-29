import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { accounts, sessions, users } from "./schema.js";
import { config } from "./config.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts }
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [config.CORS_ORIGIN],
  advanced: { defaultCookieAttributes: { secure: config.NODE_ENV === "production", sameSite: "lax" } }
});
