# SotuvCRM Baseline Audit

Date: 2026-10-30

## Scope and baseline

The repository does not contain `docs/TZ.md`, `DECISIONS.md`, or `docs/design/`.
The README describes an M0 technical foundation, not the complete operator and
sales-head CRM in the handover request. Findings below are based only on tracked
code and the running Compose setup. Missing product requirements are not guessed.

The documented `docker compose up -d --build` command succeeded. MongoDB and
Redis reported healthy, the backend health endpoint returned HTTP 200, and the
frontend returned HTTP 200. This environment's ignored `.env` overrides the
README's default host ports; the Compose-mapped frontend and backend were
reachable. Backend build, lint, unit tests (3/3), and e2e tests (3/3) passed.
Frontend build/typecheck and lint passed. There are no frontend tests.

Browser routes found in the React router are `/`, `/login`, and `/dashboard`.
The login screen rendered in Playwright. Its unauthenticated session check
produced repeated HTTP 401 console errors. Opening `/dashboard` while logged out
rendered no usable page and remained in its loading state. Role-specific testing
could not be performed: there is no seed/bootstrap account, user-creation API,
or `operator`/`sales_head` role in the current code. No mock accounts or data
were added.

## Findings

| # | Severity | Area | Reproduction / evidence | Planned fix |
|---|---|---|---|---|
| 1 | blocker | product/spec | `docs/TZ.md`, `DECISIONS.md`, and `docs/design/` are absent; README describes only M0. | Recover the approved sources of truth before implementing product behavior. Do not infer features or role policy. |
| 2 | blocker | CRM functionality | Backend currently exposes API health/info and auth; the frontend has only login and a placeholder dashboard. There are no lead, pipeline, call, or sales-head screens/modules in tracked source. | Implement the spec's exact FRs after the TZ is available; maintain this as a blocked scope meanwhile. |
| 3 | major | auth/routing | Baseline: open `/dashboard` directly in a fresh browser session. The protected route remained in its loading state because auth initialization was only invoked by `useAuth` on the login page. | **Resolved:** session restoration now runs at app startup, and direct `/dashboard` and `/` visits redirect to `/login` when unauthenticated. A valid logged-in role remains unverified because no test accounts exist. |
| 4 | major | auth/testability | No documented seed, bootstrap flow, or user creation controller exists. Existing role literals are `super_admin`, `workspace_super_admin`, and `admin`; the requested operator/sales-head role paths cannot be exercised. | Align user provisioning and role tests with the recovered TZ and confirmed decisions. |
| 5 | major | tenancy | `workspacePlugin` is attached to the user schema only. No lead/resource models or cross-workspace integration tests exist, so the required global fail-closed and foreign-resource-404 behavior cannot be demonstrated. | Establish and test workspace scoping for each spec resource before adding/refactoring its API. |
| 6 | major | auth/session | Baseline: the frontend response interceptor attempted refresh for any 401, including refresh requests, producing repeated unauthorized requests on a fresh session. Login/logout/session restoration lack backend-integrated tests. | **Partially resolved:** session initialization is now app-wide and deduplicated; login/refresh 401s cannot recursively refresh, and other requests retry at most once. Valid credential, refresh rotation, and logout flows remain unverified without provisioned users. |
| 7 | major | deployment | Baseline: Compose started the frontend with the Vite development server and no CI workflow was tracked. | **Implemented:** the frontend image builds static assets and serves them through Nginx, which reverse-proxies `/api`; Compose includes frontend health checks and a GitHub Actions CI workflow. Both existing and isolated fresh-project Compose starts passed locally. The GitHub-hosted workflow has not yet run. |
| 8 | major | quality/i18n | Baseline: frontend copy was inline and no i18n setup existed. | **Resolved for existing screens:** i18next now provides Uzbek and Russian copy, selects Russian for a Russian browser and Uzbek otherwise, and localizes the login error and existing role labels. Playwright verified both login locales. No language selector was added without the approved UX spec. |
| 9 | minor | UI | Baseline login was a basic form and the dashboard showed “STEP 1”; no approved design screens are present. | **Partially resolved:** removed the implementation placeholder and improved the dashboard heading and accessible labels. Full UI polish remains blocked until approved designs or TZ tokens are available. |
| 10 | minor | test coverage | Backend tests cover only the info/health controller; frontend has no test script or browser regression suite. | Add focused auth, tenancy, and route tests alongside the related implementation. |

## Exit notes

- Baseline commands run from the repository root initially failed because there
  is intentionally no root `package.json`; the documented per-app commands then
  passed when run from the app package roots.
- No baseline source files were changed by linting.
- Authentication as both requested roles and the full CRM workflow remain
  blocked by the missing specification, account provisioning, and features.
