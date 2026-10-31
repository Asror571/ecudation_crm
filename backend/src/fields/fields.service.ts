import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FieldDef, FieldDefDocument, FieldType, type FieldOption, type FieldTypeType } from './schemas/field-def.schema';
import { FieldGroup, FieldGroupDocument } from './schemas/field-group.schema';
import { EntityType, type EntityTypeType } from '../common/constants/entity-types';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class FieldsService {
  constructor(
    @InjectModel(FieldDef.name) private fieldDefModel: Model<FieldDefDocument>,
    @InjectModel(FieldGroup.name) private fieldGroupModel: Model<FieldGroupDocument>,
  ) {}

  async createFieldGroup(
    entity: EntityTypeType,
    name: string,
    workspaceId: string,
    collapsedByDefault?: boolean,
  ): Promise<FieldGroupDocument> {
    const count = await TenantContext.run(workspaceId, () =>
      this.fieldGroupModel.countDocuments({ entity }).exec(),
    );

    const group = new this.fieldGroupModel({
      entity,
      name,
      workspaceId,
      order: count,
      collapsedByDefault: collapsedByDefault || false,
    });

    return TenantContext.run(workspaceId, () => group.save());
  }

  async findFieldGroups(entity: EntityTypeType, workspaceId: string): Promise<FieldGroupDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.fieldGroupModel.find({ entity }).sort({ order: 1 }).exec(),
    );
  }

  async updateFieldGroup(
    id: string,
    updateData: Partial<FieldGroup>,
    workspaceId: string,
  ): Promise<FieldGroupDocument> {
    const group = await TenantContext.run(workspaceId, () =>
      this.fieldGroupModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!group) {
      throw new NotFoundException('Field group not found');
    }

    return group;
  }

  async deleteFieldGroup(id: string, workspaceId: string): Promise<void> {
    const result = await TenantContext.run(workspaceId, () =>
      this.fieldGroupModel.findByIdAndDelete(id).exec(),
    );

    if (!result) {
      throw new NotFoundException('Field group not found');
    }
  }

  async createFieldDef(
    entity: EntityTypeType,
    name: string,
    type: FieldTypeType,
    workspaceId: string,
    code?: string,
    options?: FieldOption[],
    groupId?: string,
    isRequired?: boolean,
    pipelineIds?: string[],
    visibleRoleIds?: string[],
    editableRoleIds?: string[],
  ): Promise<FieldDefDocument> {
    const finalCode = code || this.generateCode(name);

    const existing = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findOne({ code: finalCode, entity }).exec(),
    );

    if (existing) {
      throw new ConflictException('Field code already exists for this entity');
    }

    const field = new this.fieldDefModel({
      entity,
      name,
      code: finalCode,
      type,
      workspaceId,
      options: options || [],
      groupId,
      isRequired: isRequired || false,
      pipelineIds: pipelineIds || [],
      visibleRoleIds: visibleRoleIds || [],
      editableRoleIds: editableRoleIds || [],
    });

    const count = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.countDocuments({ entity }).exec(),
    );

    field.order = count;

    return TenantContext.run(workspaceId, () => field.save());
  }

  async findFieldDefs(entity: EntityTypeType, workspaceId: string): Promise<FieldDefDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.fieldDefModel.find({ entity }).sort({ order: 1 }).exec(),
    );
  }

  async updateFieldDef(
    id: string,
    updateData: Partial<FieldDef>,
    workspaceId: string,
  ): Promise<FieldDefDocument> {
    const field = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findById(id).exec(),
    );

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    if (updateData.type && updateData.type !== field.type) {
      throw new BadRequestException('Cannot change field type');
    }

    if (updateData.code && updateData.code !== field.code) {
      throw new BadRequestException('Cannot change field code');
    }

    return TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );
  }

  async archiveFieldDef(id: string, workspaceId: string): Promise<FieldDefDocument> {
    const field = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec(),
    );

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    return field;
  }

  async restoreFieldDef(id: string, workspaceId: string): Promise<FieldDefDocument> {
    const field = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findByIdAndUpdate(id, { isArchived: false }, { new: true }).exec(),
    );

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    return field;
  }

  async addFieldOption(
    fieldId: string,
    label: string,
    workspaceId: string,
  ): Promise<FieldDefDocument> {
    const field = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findById(fieldId).exec(),
    );

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const newOption: FieldOption = {
      id: new Date().getTime().toString(),
      label,
      order: field.options.length,
      isArchived: false,
    };

    field.options.push(newOption);

    return TenantContext.run(workspaceId, () => field.save());
  }

  async archiveFieldOption(fieldId: string, optionId: string, workspaceId: string): Promise<FieldDefDocument> {
    const field = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.findById(fieldId).exec(),
    );

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const option = field.options.find((o) => o.id === optionId);
    if (!option) {
      throw new NotFoundException('Option not found');
    }

    option.isArchived = true;

    return TenantContext.run(workspaceId, () => field.save());
  }

  private generateCode(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
