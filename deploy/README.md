# VPS deployment artifacts

These files are templates for the isolated SAM UC Trader Bot deployment.

- `systemd/sam-uc-trader-api.service` starts the API as the unprivileged `traderbot` user and binds it to `127.0.0.1`.
- `nginx/sammyucfx.name.ng.conf` serves the built frontend and proxies `/api/` to the local backend.

Install the system-level files only after the production environment file is present at `/etc/sam-uc-trader-bot/backend.env`, the backend migration state is reviewed, and DNS for `sammyucfx.name.ng` resolves to this VPS. `LIVE_TRADING_ENABLED` must remain `false`.
