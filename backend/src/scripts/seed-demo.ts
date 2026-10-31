import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { Rights } from '../roles/schemas/role.schema';

const demoUser = {
  firstName: 'Demo',
  lastName: 'Admin',
  email: process.env.DEMO_ADMIN_EMAIL ?? 'local-demo-admin@education-crm.local',
  password: process.env.DEMO_ADMIN_PASSWORD ?? 'DemoCrm2026!',
};
const demoWorkspace = {
  name: 'Education CRM Demo',
  slug: 'education-crm-demo',
};

const defaultRights: Rights = {
  deals: { view: 'all', add: 'all', edit: 'all', delete: 'all', export: 'all' },
  contacts: { view: 'all', add: 'all', edit: 'all', delete: 'all', export: 'all' },
  companies: { view: 'all', add: 'all', edit: 'all', delete: 'all', export: 'all' },
  tasks: { view: 'all', add: 'all', edit: 'all', delete: 'all' },
  conversations: { view: 'all', add: 'all', edit: 'all', delete: 'all' },
  analytics: 'all',
  settings: {
    pipelines: true,
    fields: true,
    users: true,
    integrations: true,
    templates: true,
    api: true,
  },
  canExportAll: true,
  canSeeUnsorted: true,
};

async function seedDemo(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('DemoSeed');

  try {
    const config = app.get(ConfigService);
    if (config.get<string>('NODE_ENV') !== 'development') {
      throw new Error('Demo accounts can only be seeded in development.');
    }

    const usersService = app.get(UsersService);
    const rolesService = app.get(RolesService);
    const workspacesService = app.get(WorkspacesService);
    const workspace =
      (await workspacesService.findBySlug(demoWorkspace.slug)) ??
      (await workspacesService.create(demoWorkspace.name, demoWorkspace.slug));

    const existingUser = await usersService.findByEmail(demoUser.email);
    const workspaceId = workspace._id.toString();
    if (existingUser && existingUser.workspaceId !== workspaceId) {
      throw new Error(
        `The demo email ${demoUser.email} is already assigned to another workspace.`,
      );
    }

    const adminRole =
      (await rolesService.findByName('owner', workspaceId)) ??
      (await rolesService.create('owner', defaultRights, workspaceId));

    const password = await bcrypt.hash(demoUser.password, 10);
    if (existingUser) {
      await usersService.update(
        existingUser._id.toString(),
        {
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          password,
          roleId: adminRole._id.toString(),
          isActive: true,
        },
        workspaceId,
      );
    } else {
      await usersService.create({
        ...demoUser,
        roleId: adminRole._id.toString(),
        workspaceId,
      });
    }

    logger.log(`Demo login ready: ${demoUser.email}`);
  } finally {
    await app.close();
  }
}

seedDemo().catch((error: unknown) => {
  const logger = new Logger('DemoSeed');
  const details =
    error instanceof Error
      ? (error.stack ?? error.message)
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  logger.error('Failed to seed the demo account', details);
  process.exitCode = 1;
});
