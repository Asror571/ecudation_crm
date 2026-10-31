import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { EducationTemplateService } from './education-template';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { FieldsModule } from '../fields/fields.module';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    PipelinesModule,
    FieldsModule,
    CatalogsModule,
    UsersModule,
    RolesModule,
    GroupsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, EducationTemplateService],
  exports: [EducationTemplateService],
})
export class SettingsModule {}
