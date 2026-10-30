# Project Progress

## Current milestone

M0 — audit and foundation. Implementation and validation are complete.

## Done

- Audited the existing codebase and recorded current scope, gaps, and milestone
  worklist in [AUDIT.md](./AUDIT.md).
- Converted approved specification sections 1–13 into [TZ.md](./TZ.md).
- Moved the applications to top-level `backend/` and `frontend/` packages;
  added package READMEs and retained independent package manifests/lockfiles.
- Added a MongoDB `rs0` single-node replica-set bootstrap with persisted private
  key storage, Redis, Compose health checks, and `.env.example`.
- Added/retained Joi environment validation and added focused schema tests.
- Registered the tenant plugin at the Mongoose connection. `TenantContext`
  uses `AsyncLocalStorage`, fails closed, logs explicit bypasses, scopes query
  and aggregation paths, validates writes, and rejects unsafe count estimates.
- Scoped user ID/session updates by workspace; the two audited global identity
  lookups are explicit `runWithoutTenant()` calls.
- Configured static production frontend serving through Nginx with Docker DNS
  resolution for backend replacement, and retained GitHub Actions CI.
- Updated root/package setup docs and recorded foundation choices in
  [DECISIONS.md](../DECISIONS.md).

## In progress

- None. M0 is complete; wait for the user's “continue” before starting M1.

## Next

- Stop after M0 report and wait for the user's “continue”.
- M1: implement the TZ authentication lifecycle, users, groups, roles and
  backend rights matrix with tenant-isolation e2e tests.

## Known issues / blockers

- The current application is only a foundation: the CRM modules and TZ roles
  are not implemented. See [AUDIT.md](./AUDIT.md).
- No role-specific accounts/bootstrap workflow exists yet; full role-based
  browser verification belongs to M1.
- Compose currently uses a one-member Mongo replica set and is not highly
  available; production hardening is M15.
- Frontend automated tests and CRM route coverage do not exist yet; add them
  with the relevant feature milestones.

## Verification log

- Baseline before M0: backend build/lint, unit (3/3), and e2e (3/3) passed;
  frontend build/typecheck and lint passed.
- Earlier milestones: auth route restoration, Nginx serving/proxy, CI, and
  Uzbek/Russian UI were verified with package checks, Compose health, and
  Playwright.
- Final M0: backend build/lint passed; unit tests passed (16/16); e2e passed
  (3/3); frontend build/typecheck and lint passed.
- Docker Compose config and Mongo entrypoint shell syntax passed. `docker compose
  up -d --build` succeeded; all four services ran healthy, MongoDB
  reported `rs0` primary with one member, and frontend plus API-through-Nginx
  returned HTTP 200 after backend recreation.
- A separate fresh-project Compose startup using temporary credentials was
  previously verified; its temporary environment and isolated resources were
  removed. Existing MongoDB data volumes were retained.
- `git diff --check` passed.
