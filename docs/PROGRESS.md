# Project Progress

## Current phase

Phase 1: repository restructure into `frontend/` and `backend/`.

## Completed

- Phase 0 recon and baseline checks.
- Created [AUDIT.md](./AUDIT.md) with findings, reproduction evidence, and a
  phased worklist.
- Confirmed Docker Compose startup and API health; backend and frontend builds
  and linters pass, backend unit/e2e suites pass.
- Confirmed the source-of-truth files (`docs/TZ.md`, `DECISIONS.md`, and
  `docs/design/`) are not present in the checkout.

## In progress

- Move the app directories using `git mv`, then update Compose, Docker/build
  contexts, README paths, and any relative configuration references.
- Keep tenant scoping behavior intact and run all baseline checks after moves.

## Next

- Phase 2: resolve authentication initialization and refresh retry defects.
- Continue with deployment, UI, and other work only where requirements can be
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
