import { Injectable } from '@nestjs/common';
import type { PipelineDocument } from './schemas/pipeline.schema';
import type { RoleDocument } from '../roles/schemas/role.schema';
import type { UserDocument } from '../users/schemas/user.schema';

export type PipelineAccessLevel = 'none' | 'view' | 'edit';

export type PipelineWithAccess = PipelineDocument & { access: PipelineAccessLevel };

@Injectable()
export class PipelineAccessService {
  getAccess(
    user: UserDocument,
    pipeline: PipelineDocument,
    role: RoleDocument,
  ): PipelineAccessLevel {
    if (!role.pipelineAccess) {
      return 'none';
    }

    const explicitAccess = role.pipelineAccess[pipeline._id.toString()];
    if (explicitAccess) {
      return explicitAccess;
    }

    if (pipeline.groupIds.length === 0) {
      return role.rights?.settings?.pipelines ? 'edit' : 'view';
    }

    const userGroupIds = user.groupIds || [];
    const hasGroupAccess = pipeline.groupIds.some((gid) =>
      userGroupIds.includes(gid.toString()),
    );

    if (!hasGroupAccess) {
      return 'none';
    }

    return role.rights?.settings?.pipelines ? 'edit' : 'view';
  }

  filterVisiblePipelines(
    user: UserDocument,
    pipelines: PipelineDocument[],
    role: RoleDocument,
  ): PipelineDocument[] {
    return pipelines.filter((p) => this.getAccess(user, p, role) !== 'none');
  }
}
