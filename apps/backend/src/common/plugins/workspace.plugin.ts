import { Schema, type Query } from 'mongoose';

function applyWorkspaceFilter(this: Query<unknown, unknown>): void {
  const options: unknown = this.getOptions();
  if (typeof options !== 'object' || options === null) {
    return;
  }

  const { skipWorkspaceFilter, workspaceId } = options as Record<
    string,
    unknown
  >;
  if (skipWorkspaceFilter !== true) {
    this.where({ workspaceId });
  }
}

export function workspacePlugin(schema: Schema): void {
  schema.pre('save', function () {
    if (!this.get('workspaceId')) {
      throw new Error('workspaceId is required');
    }
  });

  schema.pre(
    [
      'find',
      'findOne',
      'findOneAndUpdate',
      'findOneAndDelete',
      'deleteMany',
      'deleteOne',
      'countDocuments',
      'updateMany',
      'updateOne',
    ],
    applyWorkspaceFilter,
  );
}
