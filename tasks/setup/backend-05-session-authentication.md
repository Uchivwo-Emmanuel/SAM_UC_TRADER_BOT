# Backend 05 — Implement dashboard session authentication

## Scope

Configure secure Better Auth session, cookie, trusted-origin, and logout behavior for the small, invite-only user group; remove custom JWT issuance from scope.

## Definition of done

Unauthenticated requests are rejected; Better Auth sessions use secure cookie settings and safe expiry; session retrieval is covered by integration tests.

## Dependencies

backend-04

## Guardrails

Keep this task small. Do not add live trading, credentials, or unrelated features while completing it.
