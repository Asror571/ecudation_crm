# M2 Handover Document

## Exported Services for M3/M4

### CustomFieldsService
Location: `backend/src/fields/custom-fields.service.ts`

**Key Methods:**
- `getApplicableFields(entity, {pipelineId, roleId}, workspaceId)` - Returns fields visible to a role for a given entity/pipeline
- `validateAndNormalize(entity, values, {pipelineId, role, mode, workspaceId})` - Validates and normalizes field values
- `checkRequiredForStage(stageId, dealValues, workspaceId)` - Returns missing required fields for a stage

**Validation Rules:**
- Number: must be finite
- Switch: must be boolean
- Select/Multiselect: options must exist and not be archived
- Date/Datetime: must be valid ISO format
- URL: must be valid URL
- Email: must be valid email format
- Phone: normalized to +998XXXXXXXXX format
- Text/Textarea: max 10000 characters

### PipelineAccessService
Location: `backend/src/pipelines/pipeline-access.service.ts`

**Key Methods:**
- `getAccess(user, pipeline, role)` - Returns 'none' | 'view' | 'edit' based on role's pipelineAccess and pipeline's groupIds
- `filterVisiblePipelines(user, pipelines, role)` - Filters pipelines to only those the user can see

**Access Logic:**
- If role has explicit pipelineAccess mapping, use that
- If pipeline.groupIds is empty, visible to all (if role.settings.pipelines = true)
- If pipeline.groupIds is set, user must be in at least one group
- Final access level determined by role.settings.pipelines (edit) or (view)

### PipelineUsageRegistry
Location: `backend/src/pipelines/pipeline-usage-registry.ts`

**Purpose:** Registry for checking if pipelines/stages have active deals before deletion

**Interface:**
```typescript
interface UsageChecker {
  countPipelines(pipelineIds: string[]): Promise<Map<string, number>>;
  countStages(stageIds: string[]): Promise<Map<string, number>>;
}
```

**Usage:**
- M4 will register a `DealsUsageChecker` implementing this interface
- Call `pipelineUsageRegistry.register(checker)` to add a checker
- Use `getPipelineUsage()` and `getStageUsage()` to check before deletion

## Error Codes

### Pipeline Errors
- `INVALID_STAGE_ORDER` - Stage order violates invariants (incoming must be first, won before lost, etc.)
- `CANNOT_DELETE_LAST_PIPELINE` - Workspace must have at least one pipeline
- `CANNOT_DELETE_INCOMING_STAGE` - Incoming stage cannot be deleted
- `CANNOT_DELETE_WITH_ACTIVE_DEALS` - Pipeline/stage has active deals, specify moveDealsToStageId

### Field Errors
- `FIELD_NOT_EDITABLE` - Role cannot edit this field
- `REQUIRED_FIELDS` - Missing required fields (returns list of field codes)
- `INVALID_REQUIRED_FIELD` - Required field ID does not reference an active deal field
- `FIELD_CODE_EXISTS` - Field code already exists for this entity
- `CANNOT_CHANGE_FIELD_TYPE` - Field type is immutable after creation
- `CANNOT_CHANGE_FIELD_CODE` - Field code is immutable after creation

### Template Errors
- `WORKSPACE_NOT_EMPTY` - Cannot apply template if workspace already has pipelines

## Invariants Enforced

### Pipeline Invariants
1. Every pipeline has exactly ONE `incoming` stage (always first, cannot be deleted/moved)
2. Every pipeline has at least ONE `won` and ONE `lost` stage
3. `won` and `lost` stages are always last (won before lost)
4. `open` stages live between incoming and won
5. Exactly one default pipeline per workspace
6. Last remaining pipeline cannot be deleted

### Stage Invariants
1. Incoming stage order cannot be changed
2. Won stage cannot move after lost stage
3. Open stages cannot move after won stage
4. Cannot delete if only won/lost stage remains
5. Cannot delete incoming stage

### Field Invariants
1. Field code is unique per entity and immutable
2. Field type is immutable after creation
3. Options have stable IDs; removal archives rather than deletes
4. Fields are archived, not hard-deleted
5. editableRoleIds must be subset of visibleRoleIds (or empty = same as visible)
6. Required field validation only in create mode

## Tenant Isolation

All M2 collections are tenant-scoped through the existing plugin:
- pipelines
- stages
- fieldGroups
- fieldDefs
- tags
- taskTypes
- lossReasons
- courses

All services use `TenantContext.run(workspaceId, () => ...)` for queries and writes.
