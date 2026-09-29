import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  BIND_HOST: z.string().default("127.0.0.1"),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  AUTH_INVITE_ONLY: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  AUTH_ALLOWED_EMAILS: z.string().default("").transform((value) => value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)),
  LIVE_TRADING_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  DERIV_ACCOUNT_MODE: z.enum(["demo", "live"]).default("demo"),
  DERIV_APP_ID: z.string().optional(),
  DERIV_API_TOKEN: z.string().optional(),
  DERIV_WEBSOCKET_URL: z.string().url().default("wss://ws.derivws.com/websockets/v3"),
  DERIV_OAUTH_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  DERIV_OAUTH_CLIENT_ID: z.string().optional(),
  DERIV_OAUTH_REDIRECT_URI: z.string().url().optional(),
  DERIV_OAUTH_SCOPES: z.string().default("trade"),
  DERIV_OAUTH_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  ANALYSIS_SERVICE_TOKEN: z.string().min(32)
});

export const config = schema.parse(process.env);
