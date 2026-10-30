import { Schema, type Aggregate, type Query } from 'mongoose';
import { TenantContext } from '../tenant-context';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function currentWorkspaceId(): string | undefined {
  if (TenantContext.isUnscoped()) {
    return undefined;
  }

  const workspaceId = TenantContext.currentWorkspaceId();
  if (!workspaceId) {
    throw new Error('TenantContext is required for tenant-scoped queries');
  }

  return workspaceId;
}

function assertWorkspaceUpdate(update: unknown, workspaceId: string): void {
  if (Array.isArray(update)) {
    throw new Error(
      'Pipeline updates are not available for tenant-scoped models',
    );
  }
  if (!isRecord(update)) {
    return;
  }

  if ('workspaceId' in update && update.workspaceId !== workspaceId) {
    throw new Error('Cannot change document workspaceId');
  }

  for (const operator of ['$set', '$setOnInsert']) {
    const values = update[operator];
    if (
      isRecord(values) &&
      'workspaceId' in values &&
      values.workspaceId !== workspaceId
    ) {
      throw new Error('Cannot change document workspaceId');
    }
  }

  const unset = update.$unset;
  if (
    (isRecord(unset) && 'workspaceId' in unset) ||
    (Array.isArray(unset) && unset.includes('workspaceId'))
  ) {
    throw new Error('Cannot remove document workspaceId');
  }

  const rename = update.$rename;
  if (
    isRecord(rename) &&
    ('workspaceId' in rename || Object.values(rename).includes('workspaceId'))
  ) {
    throw new Error('Cannot rename document workspaceId');
  }
}

function assertWorkspaceReplacement(
  replacement: unknown,
  workspaceId: string,
): void {
  if (!isRecord(replacement) || replacement.workspaceId !== workspaceId) {
    throw new Error('Document workspaceId does not match tenant context');
  }
}

export function workspacePlugin(schema: Schema): void {
  if (!schema.path('workspaceId')) {
    return;
  }

  schema.pre('save', function () {
    const workspaceId = currentWorkspaceId();
    const documentWorkspaceId = this.get('workspaceId');

    if (
      typeof documentWorkspaceId !== 'string' ||
      (workspaceId && documentWorkspaceId !== workspaceId)
    ) {
      throw new Error('Document workspaceId does not match tenant context');
    }
  });

  const applyWorkspaceFilter = function (this: Query<unknown, unknown>): void {
    const workspaceId = currentWorkspaceId();
    if (workspaceId) {
      this.where({ workspaceId });
      assertWorkspaceUpdate(this.getUpdate(), workspaceId);
    }
  };

  const replaceWorkspaceDocument = function (
    this: Query<unknown, unknown>,
  ): void {
    const workspaceId = currentWorkspaceId();
    if (workspaceId) {
      this.where({ workspaceId });
      assertWorkspaceReplacement(this.getUpdate(), workspaceId);
    }
  };

  schema.pre('find', applyWorkspaceFilter);
  schema.pre('findOne', applyWorkspaceFilter);
  schema.pre('findOneAndUpdate', applyWorkspaceFilter);
  schema.pre('findOneAndDelete', applyWorkspaceFilter);
  schema.pre('findOneAndReplace', replaceWorkspaceDocument);
  schema.pre('deleteMany', applyWorkspaceFilter);
  schema.pre('deleteOne', applyWorkspaceFilter);
  schema.pre('countDocuments', applyWorkspaceFilter);
  schema.pre('updateMany', applyWorkspaceFilter);
  schema.pre('updateOne', applyWorkspaceFilter);
  schema.pre('replaceOne', replaceWorkspaceDocument);
  schema.pre('distinct', applyWorkspaceFilter);
  schema.pre('estimatedDocumentCount', function () {
    currentWorkspaceId();
    throw new Error(
      'estimatedDocumentCount is not available for tenant-scoped models',
    );
  });

  schema.pre('insertMany', function (documents: unknown) {
    const workspaceId = currentWorkspaceId();
    const list = Array.isArray(documents) ? documents : [documents];

    for (const document of list) {
      if (
        !isRecord(document) ||
        typeof document.workspaceId !== 'string' ||
        (workspaceId && document.workspaceId !== workspaceId)
      ) {
        throw new Error('Document workspaceId does not match tenant context');
      }
    }
  });

  schema.pre('bulkWrite', function (operations: unknown[]) {
    const workspaceId = currentWorkspaceId();
    if (!workspaceId) {
      return;
    }

    for (const operation of operations) {
      if (!isRecord(operation) || Object.keys(operation).length !== 1) {
        throw new Error('Unsupported bulk operation for tenant-scoped model');
      }

      const [type, value] = Object.entries(operation)[0];
      if (!isRecord(value)) {
        throw new Error('Invalid bulk operation for tenant-scoped model');
      }

      if (type === 'insertOne') {
        if (
          !isRecord(value.document) ||
          value.document.workspaceId !== workspaceId
        ) {
          throw new Error('Document workspaceId does not match tenant context');
        }
        continue;
      }

      if (type === 'replaceOne') {
        assertWorkspaceReplacement(value.replacement, workspaceId);
      }

      if (
        type !== 'updateOne' &&
        type !== 'updateMany' &&
        type !== 'replaceOne' &&
        type !== 'deleteOne' &&
        type !== 'deleteMany'
      ) {
        throw new Error('Unsupported bulk operation for tenant-scoped model');
      }

      if (!isRecord(value.filter)) {
        throw new Error('Invalid bulk operation filter');
      }

      value.filter.workspaceId = workspaceId;
      if (type === 'updateOne' || type === 'updateMany') {
        assertWorkspaceUpdate(value.update, workspaceId);
      }
    }
  });

  schema.pre('aggregate', function (this: Aggregate<unknown[]>) {
    const workspaceId = currentWorkspaceId();
    if (workspaceId) {
      this.pipeline().unshift({ $match: { workspaceId } });
    }
  });
}
