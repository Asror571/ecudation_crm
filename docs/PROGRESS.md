# Project Progress

## Current phase

Phase 3: production deployment and CI preparation.

## Completed

- Phase 0 recon and baseline checks.
- Created [AUDIT.md](./AUDIT.md) with findings, reproduction evidence, and a
  phased worklist.
- Confirmed Docker Compose startup and API health; backend and frontend builds
  and linters pass, backend unit/e2e suites pass.
- Confirmed the source-of-truth files (`docs/TZ.md`, `DECISIONS.md`, and
  `docs/design/`) are not present in the checkout.
- Phase 1 moved the apps with `git mv` to the required top-level
  `backend/` and `frontend/` directories and updated Compose, README, and backend
  root `.env` lookup paths.
- Confirmed no tracked references to the old `apps/backend` or `apps/frontend`
  paths remain; only the two required top-level code folders exist.
- Rebuilt and restarted Compose successfully after the move.
- Rechecked `workspacePlugin`: scoped queries receive their workspace filter
  and missing `workspaceId` fails closed.
- Phase 2 fixed session restoration on all routes, removed stale persisted
  authentication state, deduplicated startup checks, and limited refresh retries
  to eligible 401 responses.
- Corrected the frontend login response type to match the backend's cookie-only
  token contract.
- Browser verification now confirms fresh `/dashboard` and `/` visits render the
  login form instead of remaining on a loading screen.

## In progress

- Add production static frontend serving/reverse proxy, health/configuration
  guidance, and CI checks using the current toolchain.
- Keep the required `backend/` and `frontend/` top-level layout and the
  workspace fail-closed behavior verified.

## Next

- Continue with UI and product work only where requirements can be
  established from tracked source; spec-dependent product functionality is
  blocked until `docs/TZ.md` and `DECISIONS.md` are restored.

## Known issues / blockers

- See [AUDIT.md](./AUDIT.md), especially findings 1, 2, and 4.
- Role-specific browser verification is not currently possible without approved
  operator and sales-head accounts.
- Current Docker services are running from the baseline Compose setup.

## Verification log

- `docker compose up -d --build`: passed.
- Docker health: MongoDB and Redis healthy; backend healthy.
- Backend `build`, `lint -- --no-fix`, unit tests: passed (3 tests).
- Backend e2e tests: passed (3 tests).
- Frontend `build` (includes TypeScript build), `lint`: passed.
- Browser: `/login` rendered; fresh unauthenticated `/dashboard` remained
  loading; role-specific tests blocked.
- Phase 1 after-move backend build/lint/unit/e2e and frontend build/lint: passed.
- Docker rebuild: passed; backend health HTTP 200 and frontend HTTP 200.
- Workspace isolation probe: scoped filter applied and missing tenant rejected.
- Phase 2 frontend build/lint, backend build/lint/unit/e2e: passed.
- Browser after auth fix: `/dashboard` and `/` both resolve to the login form;
  no failed requests or JavaScript page errors; unauthenticated `me`/refresh
  requests return expected 401 responses.
