# UzbekCRM Audit

Date: 2026-10-31

## Scope and baseline

The approved specification v3.0 has been converted into [TZ.md](./TZ.md),
covering its product-contract sections 1–13. The repository is a foundation,
not a completed CRM: the existing React/NestJS application provides login,
session restoration, a basic dashboard, health endpoints, and MongoDB-backed
users/workspaces. It does not yet implement the CRM modules in the TZ.

The project is split into top-level `frontend/` and `backend/` packages.
Compose runs MongoDB, Redis, the NestJS API, and a production-built React app
served by Nginx. CI is configured for install, lint, build, backend tests, and
Docker builds. M0 adds replica-set initialization, strict environment
validation coverage, and a connection-level tenant plugin using
`AsyncLocalStorage`.

The existing supported UI routes are `/login` and `/dashboard` (with `/`
redirecting according to session state). The login view was exercised in
Uzbek and Russian. There are no provisioned role-specific test accounts, so
operator/sales-head browser workflows are not currently testable. The baseline
had backend unit/e2e tests and no frontend test suite.

## Findings and worklist

| #   | Severity | Area                   | Current evidence / reproduction                                                                                                                                                                                                                              | Required work                                                                                                                                                                       |
| --- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | blocker  | CRM functionality      | No deals, contacts, pipelines, tasks, inbox, analytics, widgets, or sales-head screens/services are present.                                                                                                                                                 | Implement the TZ modules milestone by milestone, without introducing features outside the contract.                                                                                 |
| 2   | blocker  | roles and provisioning | Existing role literals and provisioning do not support the TZ role/group rights matrix; there are no operator/sales-head accounts for end-to-end testing.                                                                                                    | Implement M1 users, groups, roles and backend rights; add test fixtures and verify the rights matrix.                                                                               |
| 3   | major    | tenant isolation       | A connection-level plugin now scopes tenant-schema query/aggregate operations, fails closed without context, validates saves/bulk inserts, and prevents cross-tenant bulk filters or workspace reassignment. Focused unit coverage verifies these behaviors. | M1 must verify isolation end-to-end for auth/users and every later module, including forbidden-resource 404 behavior. Review new Mongoose operations against the plugin before use. |
| 4   | major    | authentication         | App-wide session restoration and bounded refresh retries are implemented. Login/refresh/logout have not been verified with provisioned users; refresh-token reuse detection and must-change-password are not implemented.                                    | M1 implements and tests the complete TZ auth lifecycle, rate limiting, and session security.                                                                                        |
| 5   | major    | deployment             | Docker Compose uses a single-node MongoDB `rs0` replica set, Redis, backend health checks, and static Nginx frontend serving. Nginx uses Docker DNS resolution for backend replacement. A single Mongo member is not highly available.                       | M0 verifies a fresh isolated Compose project and API proxy. M15 adds the production topology, TLS deployment, backups/restore, and handover docs.                                   |
| 6   | major    | UI/i18n                | Existing login/dashboard copy supports Uzbek and Russian, but there is no complete CRM UI, design system, theme implementation, or browser coverage of role-specific routes.                                                                                 | Apply TZ section 5 and localization as each UI milestone is implemented; complete responsive/a11y/browser checks in M14.                                                            |
| 7   | major    | testing                | Backend unit and e2e tests cover the existing foundation; frontend has no configured automated test suite. CRM behavior and tenant/rights scenarios are untested because the modules do not exist.                                                           | Add focused unit and e2e coverage with each milestone; do not skip or weaken tests.                                                                                                 |
| 8   | minor    | setup/documentation    | Root and package READMEs now describe the split packages and local checks; environment and replica-set requirements need to stay aligned as deployment evolves.                                                                                              | Keep setup instructions, `.env.example`, Swagger, and progress notes synchronized with implementation.                                                                              |

## M0 status

The source-of-truth documentation and foundation work are in progress. See
[PROGRESS.md](./PROGRESS.md) for verified commands and remaining exit checks.
