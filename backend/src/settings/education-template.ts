import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PipelinesService } from '../pipelines/pipelines.service';
import { StagesService } from '../pipelines/stages.service';
import { FieldsService } from '../fields/fields.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { GroupsService } from '../groups/groups.service';
import { StageType } from '../pipelines/schemas/stage.schema';
import { FieldType } from '../fields/schemas/field-def.schema';
import { EntityType } from '../common/constants/entity-types';

interface TemplateOptions {
  branches?: string[];
}

@Injectable()
export class EducationTemplateService {
  constructor(
    private pipelinesService: PipelinesService,
    private stagesService: StagesService,
    private fieldsService: FieldsService,
    private catalogsService: CatalogsService,
    private groupsService: GroupsService,
  ) {}

  async applyEducationTemplate(
    workspaceId: string,
    options: TemplateOptions = {},
  ): Promise<void> {
    const existingPipelines = await this.pipelinesService.findAll(workspaceId);
    if (existingPipelines.length > 0) {
      throw new ConflictException('WORKSPACE_NOT_EMPTY');
    }

    const { branches = [] } = options;

    if (branches.length === 0) {
      await this.createDefaultPipeline(workspaceId);
    } else {
      for (const branch of branches) {
        await this.createBranchPipeline(branch, workspaceId);
      }
    }

    await this.createDealFields(workspaceId, branches);
    await this.createContactFields(workspaceId);
    await this.createTags(workspaceId);
    await this.createTaskTypes(workspaceId);
    await this.createLossReasons(workspaceId);
    await this.createCourses(workspaceId);
  }

  private async createDefaultPipeline(workspaceId: string): Promise<void> {
    const pipeline = await this.pipelinesService.create(
      'Asosiy voronka',
      workspaceId,
      '#2563EB',
    );

    await this.createStagesForPipeline(pipeline._id.toString(), workspaceId);
  }

  private async createBranchPipeline(
    branchName: string,
    workspaceId: string,
  ): Promise<void> {
    const group = await this.groupsService.create(branchName, workspaceId);

    const pipeline = await this.pipelinesService.create(
      branchName,
      workspaceId,
      '#2563EB',
      [group._id.toString()],
    );

    await this.createStagesForPipeline(pipeline._id.toString(), workspaceId);
  }

  private async createStagesForPipeline(
    pipelineId: string,
    workspaceId: string,
  ): Promise<void> {
    const stages = [
      { name: 'Tahlil qilinmagan', type: StageType.INCOMING, color: '#6B7280' },
      { name: 'Yangi lid', type: StageType.OPEN, color: '#3B82F6' },
      { name: "Ko'tarmadi", type: StageType.OPEN, color: '#F59E0B' },
      { name: 'Qayta aloqa', type: StageType.OPEN, color: '#8B5CF6' },
      { name: 'Shu hafta', type: StageType.OPEN, color: '#EC4899' },
      { name: 'Ertaga keladi', type: StageType.OPEN, color: '#06B6D4' },
      { name: 'Bugun keladi', type: StageType.OPEN, color: '#10B981' },
      { name: "To'lov", type: StageType.OPEN, color: '#F97316' },
      { name: 'Yutildi', type: StageType.WON, color: '#059669' },
      { name: "Yo'qotildi", type: StageType.LOST, color: '#DC2626' },
    ];

    for (const stage of stages) {
      await this.stagesService.create(
        pipelineId,
        stage.name,
        stage.type,
        workspaceId,
        stage.color,
      );
    }
  }

  private async createDealFields(
    workspaceId: string,
    branches: string[],
  ): Promise<void> {
    const group = await this.fieldsService.createFieldGroup(
      EntityType.DEAL,
      'Asosiy',
      workspaceId,
    );

    const courseOptions = [
      { id: '1', label: 'Ingliz tili', order: 0, isArchived: false },
      { id: '2', label: 'IELTS', order: 1, isArchived: false },
      { id: '3', label: 'Matematika', order: 2, isArchived: false },
      { id: '4', label: 'Dasturlash', order: 3, isArchived: false },
      { id: '5', label: 'Rus tili', order: 4, isArchived: false },
      { id: '6', label: 'Nemis tili', order: 5, isArchived: false },
    ];

    const branchOptions = branches.length > 0
      ? branches.map((b, i) => ({ id: String(i + 10), label: b, order: i, isArchived: false }))
      : [{ id: '10', label: 'Asosiy', order: 0, isArchived: false }];

    const sourceOptions = [
      { id: '20', label: 'Instagram', order: 0, isArchived: false },
      { id: '21', label: 'Telegram', order: 1, isArchived: false },
      { id: '22', label: 'Facebook', order: 2, isArchived: false },
      { id: '23', label: 'Target', order: 3, isArchived: false },
      { id: '24', label: 'Sayt', order: 4, isArchived: false },
      { id: '25', label: 'Tavsiya', order: 5, isArchived: false },
      { id: '26', label: 'Boshqa', order: 6, isArchived: false },
    ];

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      'Kurs',
      FieldType.SELECT,
      workspaceId,
      'kurs',
      courseOptions,
      group._id.toString(),
      true,
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      'Filial',
      FieldType.SELECT,
      workspaceId,
      'filial',
      branchOptions,
      group._id.toString(),
      true,
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      'Qayerdan keldi',
      FieldType.SELECT,
      workspaceId,
      'qayerdan_keldi',
      sourceOptions,
      group._id.toString(),
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      'Yashash hududi',
      FieldType.TEXT,
      workspaceId,
      'yashash_hududi',
      undefined,
      group._id.toString(),
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      "Markazga keldimi?",
      FieldType.SWITCH,
      workspaceId,
      'markazga_keldimi',
      undefined,
      group._id.toString(),
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      'Sinov darsi sanasi',
      FieldType.DATETIME,
      workspaceId,
      'sinov_darsi_sanasi',
      undefined,
      group._id.toString(),
    );

    await this.fieldsService.createFieldDef(
      EntityType.DEAL,
      "Mijozning bo'sh vaqti",
      FieldType.TEXT,
      workspaceId,
      'mijozning_bosh_vaqt',
      undefined,
      group._id.toString(),
    );
  }

  private async createContactFields(workspaceId: string): Promise<void> {
    const group = await this.fieldsService.createFieldGroup(
      EntityType.CONTACT,
      'Asosiy',
      workspaceId,
    );

    await this.fieldsService.createFieldDef(
      EntityType.CONTACT,
      'Yosh',
      FieldType.NUMBER,
      workspaceId,
      'yosh',
      undefined,
      group._id.toString(),
    );

    await this.fieldsService.createFieldDef(
      EntityType.CONTACT,
      'Ota-ona ismi',
      FieldType.TEXT,
      workspaceId,
      'ota_ona_ismi',
      undefined,
      group._id.toString(),
    );
  }

  private async createTags(workspaceId: string): Promise<void> {
    const tags = ['Instagram', 'Telegram', 'Facebook', 'Target', 'Tavsiya'];
    const colors = ['#E1306C', '#0088cc', '#1877F2', '#FF6B6B', '#10B981'];

    for (let i = 0; i < tags.length; i++) {
      await this.catalogsService.createTag(
        EntityType.DEAL,
        tags[i],
        colors[i],
        workspaceId,
      );
    }
  }

  private async createTaskTypes(workspaceId: string): Promise<void> {
    const taskTypes = [
      { name: "Qo'ng'iroq", icon: 'phone', defaultDeadlineMinutes: 60 },
      { name: 'Uchrashuv', icon: 'calendar', defaultDeadlineMinutes: 1440 },
      { name: 'Kuzatuv', icon: 'eye', defaultDeadlineMinutes: 4320 },
    ];

    for (const tt of taskTypes) {
      await this.catalogsService.createTaskType(
        tt.name,
        tt.icon,
        tt.defaultDeadlineMinutes,
        workspaceId,
      );
    }
  }

  private async createLossReasons(workspaceId: string): Promise<void> {
    const reasons = [
      'Qimmat',
      'Vaqt mos kelmadi',
      'Javob bermadi',
      'Boshqa markazni tanladi',
      'Qiziqmay qoldi',
      "Noto'g'ri raqam",
      'Dublikat',
      'Boshqa',
    ];

    for (const reason of reasons) {
      await this.catalogsService.createLossReason(reason, workspaceId);
    }
  }

  private async createCourses(workspaceId: string): Promise<void> {
    const courses = [
      'Ingliz tili',
      'IELTS',
      'Matematika',
      'Dasturlash',
      'Rus tili',
      'Nemis tili',
    ];

    for (const course of courses) {
      await this.catalogsService.createCourse(course, 0, workspaceId);
    }
  }
}
