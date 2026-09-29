# Deferred — AI feedback APIs and protected exports

## Affected frontend tasks

Frontend 15, 16, and 17.

## Dependency

The backend analysis scheduler, report persistence, owner-authorized report detail endpoint, and signed download endpoint.

## Required work

- Keep the AI isolated from the database: it receives only the scoped internal analysis data contract.
- Persist report provenance, strategy version, evidence references, status, and creation time.
- Sanitize report content before delivery to the browser and label it as descriptive AI analysis.
- Serve downloads only after session authorization, using short-lived signed URLs or authenticated streaming.
- Use predictable filenames and write an immutable audit event for each export.

## Done when

An owner can view a server-provided report and download an audited Markdown/TXT export; no report endpoint allows strategy changes or order execution.
