import mongoose, { Schema } from 'mongoose';
import { TenantContext } from '../tenant-context';
import { workspacePlugin } from './workspace.plugin';

describe('workspacePlugin', () => {
  const connection = mongoose.createConnection();
  connection.plugin(workspacePlugin);
  const schema = new Schema(
    { workspaceId: { type: String, required: true } },
    { bufferCommands: false },
  );
  const model = connection.model('TenantPluginTest', schema);

  afterAll(async () => {
    await connection.close();
  });

  it('scopes queries and aggregations to the active workspace', async () => {
    const query = model.find({ active: true });

    await expect(
      TenantContext.run('workspace-a', () => query.exec()),
    ).rejects.toThrow();
    expect(query.getFilter()).toEqual({
      active: true,
      workspaceId: 'workspace-a',
    });

    const conflictingQuery = model.find({ workspaceId: 'workspace-b' });
    await expect(
      TenantContext.run('workspace-a', () => conflictingQuery.exec()),
    ).rejects.toThrow();
    expect(conflictingQuery.getFilter().workspaceId).toBe('workspace-a');

    const aggregate = model.aggregate([{ $sort: { _id: 1 } }]);
    await expect(
      TenantContext.run('workspace-b', () => aggregate.exec()),
    ).rejects.toThrow();
    expect(aggregate.pipeline()[0]).toEqual({
      $match: { workspaceId: 'workspace-b' },
    });
  });

  it('rejects tenant queries with no context', async () => {
    await expect(model.find().exec()).rejects.toThrow(
      'TenantContext is required for tenant-scoped queries',
    );

    await expect(model.aggregate().exec()).rejects.toThrow(
      'TenantContext is required for tenant-scoped queries',
    );
  });

  it('only allows explicitly audited unscoped queries', async () => {
    const query = model.find();

    await expect(
      TenantContext.runWithoutTenant('authentication_email_lookup', () =>
        query.exec(),
      ),
    ).rejects.toThrow();
    expect(query.getFilter()).not.toHaveProperty('workspaceId');
  });

  it('rejects saving documents from another workspace', async () => {
    const document = new model({ workspaceId: 'workspace-b' });

    await expect(
      TenantContext.run('workspace-a', () => document.save()),
    ).rejects.toThrow('Document workspaceId does not match tenant context');
  });

  it('scopes bulk writes and prevents tenant reassignment', async () => {
    const operations = [
      {
        updateOne: {
          filter: { active: true },
          update: { $set: { active: false } },
        },
      },
    ];

    await expect(
      TenantContext.run('workspace-a', () => model.bulkWrite(operations)),
    ).rejects.toThrow();
    expect(operations[0].updateOne.filter).toEqual({
      active: true,
      workspaceId: 'workspace-a',
    });

    await expect(
      TenantContext.run('workspace-a', () =>
        model
          .updateOne(
            { _id: new mongoose.Types.ObjectId() },
            { $set: { workspaceId: 'workspace-b' } },
          )
          .exec(),
      ),
    ).rejects.toThrow('Cannot change document workspaceId');
  });

  it('scopes distinct queries and blocks unscoped document estimates', async () => {
    const distinct = model.distinct('email', { active: true });

    await expect(
      TenantContext.run('workspace-a', () => distinct.exec()),
    ).rejects.toThrow();
    expect(distinct.getFilter()).toEqual({
      active: true,
      workspaceId: 'workspace-a',
    });

    await expect(
      TenantContext.run('workspace-a', () =>
        model.estimatedDocumentCount().exec(),
      ),
    ).rejects.toThrow(
      'estimatedDocumentCount is not available for tenant-scoped models',
    );
  });

  it('rejects insertMany documents assigned to another workspace', async () => {
    await expect(
      TenantContext.run('workspace-a', () =>
        model.insertMany([{ workspaceId: 'workspace-b' }]),
      ),
    ).rejects.toThrow('Document workspaceId does not match tenant context');
  });

  it('rejects replacements that omit or change workspaceId', async () => {
    await expect(
      TenantContext.run('workspace-a', () =>
        model
          .replaceOne(
            { _id: new mongoose.Types.ObjectId() },
            { email: 'redacted@example.invalid' },
          )
          .exec(),
      ),
    ).rejects.toThrow('Document workspaceId does not match tenant context');
  });
});
