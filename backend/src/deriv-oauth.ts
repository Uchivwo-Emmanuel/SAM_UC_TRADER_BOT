import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { config } from "./config.js";
import { derivOauthCredentials } from "./schema.js";

const AUTHORIZATION_ENDPOINT = "https://auth.deriv.com/oauth2/auth";
const TOKEN_ENDPOINT = "https://auth.deriv.com/oauth2/token";
const STATE_COOKIE = "deriv_oauth_state";
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

type PendingAuthorization = { userId: string; state: string; verifier: string; issuedAt: number };
type TokenResponse = { access_token: string; expires_in: number; token_type: string };

const base64url = (value: Buffer) => value.toString("base64url");
const fromBase64url = (value: string) => Buffer.from(value, "base64url");

const oauthConfig = () => {
  if (!config.DERIV_OAUTH_ENABLED) throw new Error("Deriv OAuth is disabled");
  if (!config.DERIV_OAUTH_CLIENT_ID || !config.DERIV_OAUTH_REDIRECT_URI || !config.DERIV_OAUTH_TOKEN_ENCRYPTION_KEY) {
    throw new Error("Deriv OAuth configuration is incomplete");
  }
  if (!/^[a-f0-9]{64}$/i.test(config.DERIV_OAUTH_TOKEN_ENCRYPTION_KEY)) throw new Error("DERIV_OAUTH_TOKEN_ENCRYPTION_KEY must contain 64 hexadecimal characters");
  return {
    clientId: config.DERIV_OAUTH_CLIENT_ID,
    redirectUri: config.DERIV_OAUTH_REDIRECT_URI,
    scopes: config.DERIV_OAUTH_SCOPES.split(/\s+/).filter(Boolean),
    encryptionKey: Buffer.from(config.DERIV_OAUTH_TOKEN_ENCRYPTION_KEY, "hex")
  };
};

const stateSigningKey = () => createHash("sha256").update(config.BETTER_AUTH_SECRET).digest();
const sign = (payload: string) => base64url(createHmac("sha256", stateSigningKey()).update(payload).digest());

const encodePendingAuthorization = (pending: PendingAuthorization) => {
  const payload = base64url(Buffer.from(JSON.stringify(pending)));
  return `${payload}.${sign(payload)}`;
};

const decodePendingAuthorization = (value?: string): PendingAuthorization | undefined => {
  if (!value) return undefined;
  const [payload, receivedSignature, extra] = value.split(".");
  if (!payload || !receivedSignature || extra) return undefined;
  const expectedSignature = sign(payload);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return undefined;
  try {
    const pending = JSON.parse(fromBase64url(payload).toString("utf8")) as PendingAuthorization;
    if (!pending.userId || !pending.state || !pending.verifier || !Number.isFinite(pending.issuedAt)) return undefined;
    if (Date.now() - pending.issuedAt > STATE_MAX_AGE_MS || pending.issuedAt > Date.now() + 60_000) return undefined;
    return pending;
  } catch { return undefined; }
};

const readCookie = (request: Request, name: string) => request.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
const verifier = () => base64url(randomBytes(64));
const challengeFor = (value: string) => base64url(createHash("sha256").update(value).digest());

export const createDerivAuthorizationUrl = (userId: string) => {
  const oauth = oauthConfig();
  const pending: PendingAuthorization = { userId, state: base64url(randomBytes(32)), verifier: verifier(), issuedAt: Date.now() };
  const url = new URL(AUTHORIZATION_ENDPOINT);
  url.search = new URLSearchParams({ response_type: "code", client_id: oauth.clientId, redirect_uri: oauth.redirectUri, scope: oauth.scopes.join(" "), state: pending.state, code_challenge: challengeFor(pending.verifier), code_challenge_method: "S256" }).toString();
  return { url: url.toString(), cookie: encodePendingAuthorization(pending) };
};

const encrypt = (plaintext: string, key: Buffer) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${base64url(iv)}.${base64url(cipher.getAuthTag())}.${base64url(ciphertext)}`;
};

export const decryptDerivAccessToken = (ciphertext: string) => {
  const { encryptionKey } = oauthConfig();
  const [iv, authTag, encrypted, extra] = ciphertext.split(".");
  if (!iv || !authTag || !encrypted || extra) throw new Error("Invalid encrypted OAuth token");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, fromBase64url(iv));
  decipher.setAuthTag(fromBase64url(authTag));
  return Buffer.concat([decipher.update(fromBase64url(encrypted)), decipher.final()]).toString("utf8");
};

const exchangeAuthorizationCode = async (code: string, verifierValue: string) => {
  const oauth = oauthConfig();
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: oauth.clientId, code, code_verifier: verifierValue, redirect_uri: oauth.redirectUri });
  const result = await fetch(TOKEN_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!result.ok) throw new Error("Deriv OAuth code exchange failed");
  const token = await result.json() as TokenResponse;
  if (!token.access_token || token.token_type.toLowerCase() !== "bearer" || !Number.isFinite(token.expires_in) || token.expires_in <= 0) throw new Error("Deriv OAuth response was invalid");
  return token;
};

export const beginDerivOAuth = (request: Request, response: Response) => {
  const userId = (response.locals.session as { user: { id: string } }).user.id;
  const authorization = createDerivAuthorizationUrl(userId);
  response.cookie(STATE_COOKIE, authorization.cookie, { httpOnly: true, secure: config.NODE_ENV === "production", sameSite: "lax", maxAge: STATE_MAX_AGE_MS, path: "/api/auth/deriv/callback" });
  response.redirect(302, authorization.url);
};

export const completeDerivOAuth = async (request: Request, response: Response) => {
  const error = typeof request.query.error === "string" ? request.query.error : undefined;
  const code = typeof request.query.code === "string" ? request.query.code : undefined;
  const state = typeof request.query.state === "string" ? request.query.state : undefined;
  const pending = decodePendingAuthorization(readCookie(request, STATE_COOKIE));
  response.clearCookie(STATE_COOKIE, { path: "/api/auth/deriv/callback" });
  if (error || !code || !state || !pending || pending.state !== state) return response.status(400).json({ error: "Deriv authorization could not be verified" });
  try {
    const oauth = oauthConfig();
    const token = await exchangeAuthorizationCode(code, pending.verifier);
    const expiresAt = new Date(Date.now() + token.expires_in * 1000);
    const encryptedToken = encrypt(token.access_token, oauth.encryptionKey);
    await db.insert(derivOauthCredentials).values({ userId: pending.userId, accessTokenCiphertext: encryptedToken, tokenExpiresAt: expiresAt, scopes: oauth.scopes.join(" ") }).onConflictDoUpdate({ target: derivOauthCredentials.userId, set: { accessTokenCiphertext: encryptedToken, tokenExpiresAt: expiresAt, scopes: oauth.scopes.join(" "), updatedAt: new Date() } });
    return response.redirect(302, `${config.CORS_ORIGIN.replace(/\/$/, "")}/?deriv=connected`);
  } catch { return response.status(502).json({ error: "Deriv authorization could not be completed" }); }
};

/** Returns only connection metadata, never an account identifier or bearer token. */
export const getDerivOAuthStatus = async (userId: string) => {
  const [credential] = await db.select({ tokenExpiresAt: derivOauthCredentials.tokenExpiresAt, scopes: derivOauthCredentials.scopes }).from(derivOauthCredentials).where(eq(derivOauthCredentials.userId, userId)).limit(1);
  return { configured: Boolean(credential), expiresAt: credential?.tokenExpiresAt ?? null, scopes: credential?.scopes.split(" ") ?? [] };
};
