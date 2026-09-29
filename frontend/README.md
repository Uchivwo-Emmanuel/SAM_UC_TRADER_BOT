# SAM UC Trader frontend

Read-only React/Vite monitoring dashboard. It only accepts `VITE_*` configuration and contains no broker, database, AI, authentication, or service secrets.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
```

## Current integration boundary

The dashboard uses typed mock data from `src/data.ts` until the backend read APIs are completed. `src/auth.ts` creates the Better Auth browser client using only `VITE_AUTH_BASE_URL`; sign-in/session behavior remains blocked until the backend invite-only owner accounts are created and its auth routes are verified.

No trade execution controls are present. The account mode and safety label are deliberately visible on every screen.
