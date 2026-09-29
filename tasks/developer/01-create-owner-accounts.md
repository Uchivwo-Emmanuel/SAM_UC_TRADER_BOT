# Create the two owner accounts

**Status:** ready after deployment of the owner-provisioning command.

After Better Auth is deployed, create one invite-only email/password account for each owner. Use the two Gmail addresses only; do not share passwords or create public sign-up.

The exact VPS procedure is documented in `backend/OWNER_PROVISIONING.md`. First place exactly the two approved Gmail addresses in the server-only `AUTH_ALLOWED_EMAILS` value. Then run the interactive provisioning command once per address as `traderbot`; it refuses unlisted addresses, assigns the `owner` role, and records the audit event.

## Done when

- Both owners can sign in and sign out.
- Both accounts have the owner role.
- An audit event exists for each account creation and login.
