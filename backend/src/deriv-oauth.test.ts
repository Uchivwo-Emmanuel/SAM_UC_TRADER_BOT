import { beforeEach, describe, expect, it, vi } from "vitest";

const configureEnvironment = () => {
  process.env.CORS_ORIGIN = "https://sammyucfx.name.ng";
  process.env.DATABASE_URL = "postgres://test";
  process.env.BETTER_AUTH_SECRET = "a".repeat(32);
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  process.env.ANALYSIS_SERVICE_TOKEN = "b".repeat(32);
  process.env.DERIV_OAUTH_ENABLED = "true";
  process.env.DERIV_OAUTH_CLIENT_ID = "app-test";
  process.env.DERIV_OAUTH_REDIRECT_URI = "https://sammyucfx.name.ng/api/auth/deriv/callback";
  process.env.DERIV_OAUTH_SCOPES = "trade";
  process.env.DERIV_OAUTH_TOKEN_ENCRYPTION_KEY = "c".repeat(64);
};

describe("Deriv OAuth security boundary", () => {
  beforeEach(() => { configureEnvironment(); vi.resetModules(); });

  it("uses a fresh PKCE challenge and an exact registered redirect URI", async () => {
    const { createDerivAuthorizationUrl } = await import("./deriv-oauth.js");
    const { url, cookie } = createDerivAuthorizationUrl("owner-id");
    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://auth.deriv.com");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("app-test");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://sammyucfx.name.ng/api/auth/deriv/callback");
    expect(parsed.searchParams.get("scope")).toBe("trade");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("state")).toHaveLength(43);
    expect(cookie).not.toContain("owner-id");
  });

  it("rejects an invalid token encryption key before authorization", async () => {
    process.env.DERIV_OAUTH_TOKEN_ENCRYPTION_KEY = "not-a-key";
    const { createDerivAuthorizationUrl } = await import("./deriv-oauth.js");
    expect(() => createDerivAuthorizationUrl("owner-id")).toThrow("64 hexadecimal characters");
  });
});
