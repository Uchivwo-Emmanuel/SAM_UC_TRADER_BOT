# Deferred — dashboard read APIs and safe events

## Affected frontend tasks

Frontend 11, 12, and 13.

## Dependency

The backend needs authenticated, role-protected, read-only endpoints for strategy status/version, risk status, and user-safe audit events.

## Required work

- Return only approved display fields; never return credentials, tokens, raw request headers, broker payloads, or internal stack traces.
- Enforce the owner/viewer session role on every endpoint.
- Use cursor pagination and server-side filters for events.
- Include strategy version provenance and risk-rejection references.
- Do not expose a mutation endpoint to this dashboard.

## Done when

The frontend typed adapters can replace mock records and protected API tests pass.
