# Deriv OAuth integration

## What is implemented

- Owner-only OAuth initiation at `GET /api/integrations/deriv/oauth/authorize`.
- Authorization Code + PKCE (`S256`) with a new verifier and state for every attempt.
- A signed, HTTP-only, short-lived callback cookie. The callback rejects missing, expired, tampered, or mismatched state.
- Server-side exchange with `https://auth.deriv.com/oauth2/token`.
- AES-256-GCM encryption before an access token is persisted. No route returns a token, account identifier, authorization code, or ciphertext.
- Owner-only connection metadata at `GET /api/integrations/deriv/oauth/status`.
- OAuth does not enable live trading. `LIVE_TRADING_ENABLED` remains `false` and the existing Deriv client remains demo-only.

## Required production configuration

```env
DERIV_OAUTH_ENABLED=true
DERIV_OAUTH_CLIENT_ID=<the registered Deriv OAuth client ID>
DERIV_OAUTH_REDIRECT_URI=https://sammyucfx.name.ng/api/auth/deriv/callback
DERIV_OAUTH_SCOPES=trade
DERIV_OAUTH_TOKEN_ENCRYPTION_KEY=<64 lowercase-or-uppercase hexadecimal characters>
```

Generate the encryption key locally; store it only in the VPS secret manager or backend `.env`, never in Git or the frontend:

```sh
openssl rand -hex 32
```

The registered Deriv redirect URI must match `DERIV_OAUTH_REDIRECT_URI` exactly, including scheme, hostname, path, and trailing slash behavior.

## Migration plan (not applied)

Migration `drizzle/0004_deriv_oauth.sql` creates one table:

- `deriv_oauth_credentials`: one encrypted credential per platform user, primary-keyed by `user_id`; it stores ciphertext, expiry, and granted scope only.

It adds no broad database permissions, no row-level-security policy changes, and no broker connectivity. Review and apply it through the existing Supabase migration process before turning OAuth on.

## Deliberate exclusions

- No payment scope.
- No account-management scope.
- No frontend token handling or browser storage.
- No token logging, API-token display, account-number display, or automatic trading.
