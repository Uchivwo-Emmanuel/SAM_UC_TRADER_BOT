# Deferred — authenticated realtime dashboard stream

## Affected frontend task

Frontend 14.

## Dependency

An authenticated backend realtime endpoint for permitted status, market freshness, and read-only position updates.

## Required work

- Authenticate via the existing secure session cookie; do not place tokens in a websocket URL or browser storage.
- Authorize subscriptions by role and publish only whitelisted display events.
- Define event schema/version, heartbeat, stale threshold, reconnect behavior, and polling fallback.
- Test reconnect, invalid session, stale state, and event redaction.

## Done when

The frontend moves from its `mock` status to authenticated updates with no page refresh.
