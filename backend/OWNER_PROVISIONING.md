# Owner account provisioning

The public application is sign-in only. `AUTH_INVITE_ONLY=true` disables Better Auth's public email/password registration endpoint.

Create an owner account only from the VPS as the restricted `traderbot` deployment user. Before doing so, set `AUTH_ALLOWED_EMAILS` in `/etc/sam-uc-trader-bot/backend.env` to the two approved Gmail addresses, separated by a comma. Do not place passwords in that file.

After restarting the API, run this once for each approved owner:

```bash
sudo -u traderbot -H bash -lc 'set -a; . /etc/sam-uc-trader-bot/backend.env; set +a; cd /opt/sam-uc-trader-bot/backend && PATH="$HOME/.local/bin:$PATH" npm run provision:owner -- --email "owner@example.com" --name "Owner name"'
```

The command explicitly loads the same server-only environment file that systemd uses, then prompts twice for a password without echoing it. It refuses emails outside `AUTH_ALLOWED_EMAILS`, creates no browser session, assigns the `owner` role, and writes an immutable `auth.owner.provisioned` audit event. It never prints the password or a session token.

After each command succeeds, the owner can sign in at `https://sammyucfx.name.ng`.

Do not run the command with `sudo` as the application user and do not enable public sign-up.
