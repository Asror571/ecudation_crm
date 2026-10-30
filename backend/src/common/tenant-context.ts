import { AsyncLocalStorage } from 'node:async_hooks';
import { Logger } from '@nestjs/common';

export type TenantBypassReason =
  'global_email_uniqueness_check' | 'authentication_email_lookup';

type TenantState =
  | { kind: 'workspace'; workspaceId: string }
  | { kind: 'unscoped'; reason: TenantBypassReason };

const tenantStorage = new AsyncLocalStorage<TenantState>();
const logger = new Logger('TenantContext');

export class TenantContext {
  static run<T>(workspaceId: string, callback: () => T): T {
    if (workspaceId.length === 0) {
      throw new Error('workspaceId is required');
    }

    return tenantStorage.run({ kind: 'workspace', workspaceId }, callback);
  }

  static runWithoutTenant<T>(reason: TenantBypassReason, callback: () => T): T {
    logger.warn(`Tenant filter bypass: ${reason}`);
    return tenantStorage.run({ kind: 'unscoped', reason }, callback);
  }

  static currentWorkspaceId(): string | undefined {
    const state = tenantStorage.getStore();
    return state?.kind === 'workspace' ? state.workspaceId : undefined;
  }

  static isUnscoped(): boolean {
    return tenantStorage.getStore()?.kind === 'unscoped';
  }
}
