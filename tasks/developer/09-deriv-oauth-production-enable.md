# Enable Deriv OAuth in production

**Status:** blocked on owner configuration and reviewed migration

## Why this is manual

This changes an external financial-platform integration and requires secrets that must never be committed or entered into frontend code.

## Owner actions

1. Finish registering the OAuth application with the exact redirect URL: `https://sammyucfx.name.ng/api/auth/deriv/callback`.
2. Review and apply backend migration `backend/drizzle/0004_deriv_oauth.sql` using the Supabase migration workflow.
3. Add the server-only OAuth environment variables listed in `backend/DERIV_OAUTH.md` to the VPS.
4. Keep `LIVE_TRADING_ENABLED=false` and `DERIV_ACCOUNT_MODE=demo`.
5. Deploy the backend, sign in as an owner, then start the connection only through the owner-protected endpoint. Verify the status endpoint returns metadata only.

## Completion evidence

- The migration is recorded by Supabase.
- OAuth completes and redirects to the frontend without exposing a token.
- `/api/integrations/deriv/oauth/status` returns `configured: true` for the initiating owner.
- No live trading functionality is enabled.
