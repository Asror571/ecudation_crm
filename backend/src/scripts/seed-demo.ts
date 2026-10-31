import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { WorkspacesService } from '../workspaces/workspaces.service';

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

async function seedDemo(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('DemoSeed');

  try {
    const config = app.get(ConfigService);
    if (config.get<string>('NODE_ENV') !== 'development') {
      throw new Error('Demo accounts can only be seeded in development.');
    }

    const usersService = app.get(UsersService);
    const workspacesService = app.get(WorkspacesService);
    const workspace =
      (await workspacesService.findBySlug(demoWorkspace.slug)) ??
      (await workspacesService.create(
        demoWorkspace.name,
        demoWorkspace.slug,
      ));

    const existingUser = await usersService.findByEmail(demoUser.email);
    const workspaceId = workspace._id.toString();
    if (existingUser && existingUser.workspaceId !== workspaceId) {
      throw new Error(
        `The demo email ${demoUser.email} is already assigned to another workspace.`,
      );
    }

    const password = await bcrypt.hash(demoUser.password, 10);
    if (existingUser) {
      await usersService.update(
        existingUser._id.toString(),
        {
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          password,
          role: UserRole.WORKSPACE_SUPER_ADMIN,
          isActive: true,
        },
        workspaceId,
      );
    } else {
      await usersService.create({
        ...demoUser,
        role: UserRole.WORKSPACE_SUPER_ADMIN,
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
  logger.error(
    'Failed to seed the demo account',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
