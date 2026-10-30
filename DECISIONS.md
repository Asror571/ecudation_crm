# Decisions

## M0 foundation

- The supplied specification v3.0 is the product source of truth. Its sections
  1–13 are transcribed in [docs/TZ.md](./docs/TZ.md); embedded agent directions
  and the open-questions appendix are not treated as product requirements.
- The repository remains split into self-contained top-level `frontend/` and
  `backend/` packages, with deployment files in `deploy/` and product records
  in `docs/`.
- Local and initial single-host Compose environments use a one-member MongoDB
  replica set named `rs0`. This supports replica-set-dependent Mongo features
  but is not high availability; a production topology is deferred to M15.
- Compose clients use `replicaSet=rs0`. A backend run directly on the host uses
  `directConnection=true` because the replica-set member advertises Docker DNS
  name `mongodb`.
- MongoDB's internal replica-set key is generated once and stored inside the
  existing MongoDB data volume. It is not committed or printed. Removing the
  volume also removes this key and all database data; normal setup and
  verification must retain existing volumes.
- The tenant plugin is registered on the Mongoose connection before feature
  models are created. Schemas without a `workspaceId` path (for example,
  Workspace) are intentionally not tenant-scoped. Tenant models fail closed
  outside a `TenantContext`; queries, aggregations, saves, insertMany, and
  bulkWrite must preserve workspace boundaries. Operations that cannot be
  safely scoped (such as `estimatedDocumentCount`) are rejected.
- `TenantContext.runWithoutTenant()` is only for narrowly defined global
  identity operations. Each invocation logs a fixed, non-sensitive reason.

## Audited tenant bypasses

The only currently permitted unscoped service calls are:

- `global_email_uniqueness_check`: `UsersService.create` checks whether an
  email already exists globally before creating a user in its workspace.
- `authentication_email_lookup`: `UsersService.findByEmail` resolves a login
  identity before the user's workspace is known.

Refresh-token, last-login, profile, and user-ID operations now require and use
the authenticated or verified token's `workspaceId`; they do not bypass the
tenant filter. No other module currently has a tenant bypass. Any future
`runWithoutTenant()` call must have a fixed reason added here and a specific
need documented before use.

## Operational notes

- The ignored local `.env` may override documented host ports. Never print or
  commit its contents; use `.env.example` placeholders for setup.
- Do not add mock or hard-coded frontend business data. Test fixtures belong
  only in tests or backend development adapters defined by the TZ.
