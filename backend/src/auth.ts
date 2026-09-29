import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { accounts, sessions, users, verifications } from "./schema.js";
import { config } from "./config.js";

const commonOptions = {
  database: drizzleAdapter(db, {
    provider: "pg" as const,
    schema: { user: users, session: sessions, account: accounts, verification: verifications }
  }),
  trustedOrigins: (config.BETTER_AUTH_TRUSTED_ORIGINS ?? config.CORS_ORIGIN).split(",").map((origin) => origin.trim()).filter(Boolean),
  advanced: { defaultCookieAttributes: { secure: config.NODE_ENV === "production", sameSite: "lax" as const } }
};

export const auth = betterAuth({
  ...commonOptions,
  // Public registration is never available for this monitoring platform.
  emailAndPassword: { enabled: true, disableSignUp: config.AUTH_INVITE_ONLY }
});

/**
 * Used only by the local, interactive owner-provisioning command. It is never
 * mounted as an HTTP handler, so it cannot create a public registration path.
 */
export const ownerProvisioningAuth = betterAuth({
  ...commonOptions,
  emailAndPassword: { enabled: true, disableSignUp: false, autoSignIn: false }
});
