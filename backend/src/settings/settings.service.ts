import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesService } from '../pipelines/pipelines.service';
import { StagesService } from '../pipelines/stages.service';
import { FieldsService } from '../fields/fields.service';
import { CustomFieldsService } from '../fields/custom-fields.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { PipelineAccessService } from '../pipelines/pipeline-access.service';
import { EntityType } from '../common/constants/entity-types';

@Injectable()
export class SettingsService {
  constructor(
    private pipelinesService: PipelinesService,
    private stagesService: StagesService,
    private fieldsService: FieldsService,
    private customFieldsService: CustomFieldsService,
    private catalogsService: CatalogsService,
    private usersService: UsersService,
    private rolesService: RolesService,
    private pipelineAccessService: PipelineAccessService,
  ) {}

  async getBootstrap(userId: string, workspaceId: string) {
    const user = await this.usersService.findById(userId, workspaceId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.rolesService.findById(user.roleId, workspaceId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const visiblePipelines = this.pipelineAccessService.filterVisiblePipelines(
      user,
      await this.pipelinesService.findAll(workspaceId),
      role,
    );

    const pipelineIds = visiblePipelines.map((p) => p._id.toString());

    const stages = await Promise.all(
      pipelineIds.map((pid) => this.stagesService.findByPipeline(pid, workspaceId)),
    ).then((results) => results.flat());

    const dealFieldGroups = await this.fieldsService.findFieldGroups(EntityType.DEAL, workspaceId);
    const contactFieldGroups = await this.fieldsService.findFieldGroups(EntityType.CONTACT, workspaceId);
    const companyFieldGroups = await this.fieldsService.findFieldGroups(EntityType.COMPANY, workspaceId);

    const dealFields = await this.customFieldsService.getApplicableFields(
      EntityType.DEAL,
      { roleId: role._id.toString() },
      workspaceId,
    );
    const contactFields = await this.customFieldsService.getApplicableFields(
      EntityType.CONTACT,
      { roleId: role._id.toString() },
      workspaceId,
    );
    const companyFields = await this.customFieldsService.getApplicableFields(
      EntityType.COMPANY,
      { roleId: role._id.toString() },
      workspaceId,
    );

    const dealTags = await this.catalogsService.findTags(EntityType.DEAL, workspaceId);
    const contactTags = await this.catalogsService.findTags(EntityType.CONTACT, workspaceId);
    const companyTags = await this.catalogsService.findTags(EntityType.COMPANY, workspaceId);

    const taskTypes = await this.catalogsService.findTaskTypes(workspaceId);
    const lossReasons = await this.catalogsService.findLossReasons(workspaceId);
    const courses = await this.catalogsService.findCourses(workspaceId);

    return {
      pipelines: visiblePipelines,
      stages,
      fieldGroups: {
        deal: dealFieldGroups,
        contact: contactFieldGroups,
        company: companyFieldGroups,
      },
      fieldDefs: {
        deal: dealFields,
        contact: contactFields,
        company: companyFields,
      },
      tags: {
        deal: dealTags,
        contact: contactTags,
        company: companyTags,
      },
      taskTypes,
      lossReasons,
      courses,
    };
  }
}
