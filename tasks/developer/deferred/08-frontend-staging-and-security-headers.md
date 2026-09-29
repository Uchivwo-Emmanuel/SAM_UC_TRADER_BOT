# Deferred — frontend staging and security headers

## Affected frontend tasks

Frontend 18, 19, and 20.

## Dependency

The VPS/reverse-proxy staging deployment and verified production Better Auth origin.

## Required work

- Configure HTTPS for `sammyucfx.name.ng` and `www.sammyucfx.name.ng` before production login use.
- Configure a restrictive Content Security Policy, frame protection, MIME sniffing protection, referrer policy, and secure session-cookie settings.
- Set only public `VITE_*` deployment values in the frontend build environment.
- Run authenticated staging QA with the two owner accounts; do not use a real broker account.
- Record rollback artifact/version and a deployment owner.

## Done when

The staging dashboard uses HTTPS, owner sessions work, security headers are checked, and the release checklist is signed off.
