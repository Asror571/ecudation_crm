# Project Progress

## Current milestone

M2 — Settings core (pipelines, stages, custom fields, tags, task types, loss reasons, courses, education template). Backend implementation complete.

## Done

- M0: audit and foundation, tenant plugin, MongoDB replica set, CI
- M1 prerequisites (partial): Groups schema, Roles schema, basic rights matrix structure, user schema updated to use roleId/groupIds
- M2 backend:
  - Pipelines and Stages module with invariants, usage checker registry, PipelineAccessService
  - Custom Fields module (fieldGroups, fieldDefs) with CustomFieldsService and validation
  - Simple catalogs (tags, taskTypes, lossReasons, courses) with archive-only delete
  - Settings bootstrap endpoint (/settings/bootstrap) with role-based filtering
  - Education template service with Uzbek content
  - Exported services documented in HANDOVER.md for M3/M4

## In progress

- M2 frontend (not started - backend only implementation)
- M2 tests (unit, e2e, frontend, Playwright) - pending
- M2 Swagger documentation and DTOs - pending
- docs/ERRORS.md - pending

## Next

- M3: contacts, companies, duplicate detection and merge
- M4: deals (kanban, CRUD, workflows)

## Known issues / blockers

- M1 full implementation (users, groups, roles controllers, rights matrix enforcement, e2e tests) not completed - only minimal schemas and services added as M2 prerequisites
- M2 frontend not implemented
- M2 tests not implemented
- Swagger documentation not added

## Verification log

- Backend build passes with all M2 modules
- M2 backend modules: Pipelines, Stages, Fields, Catalogs, Settings all compile successfully
- Tenant isolation maintained through existing plugin for all new collections
