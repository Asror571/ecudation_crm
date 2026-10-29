import { SetMetadata } from '@nestjs/common';
import type { UserRoleType } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
