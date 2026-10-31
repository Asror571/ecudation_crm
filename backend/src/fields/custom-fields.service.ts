import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FieldDef, FieldDefDocument, type FieldOption } from './schemas/field-def.schema';
import { FieldGroup, FieldGroupDocument } from './schemas/field-group.schema';
import { EntityType, type EntityTypeType } from '../common/constants/entity-types';
import { FieldType, type FieldTypeType } from './schemas/field-def.schema';
import { TenantContext } from '../common/tenant-context';
import type { RoleDocument } from '../roles/schemas/role.schema';

interface ValidationContext {
  pipelineId?: string;
  roleId?: string;
  mode: 'create' | 'update';
}

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectModel(FieldDef.name) private fieldDefModel: Model<FieldDefDocument>,
    @InjectModel(FieldGroup.name) private fieldGroupModel: Model<FieldGroupDocument>,
  ) {}

  async getApplicableFields(
    entity: EntityTypeType,
    context: { pipelineId?: string; roleId?: string },
    workspaceId: string,
  ): Promise<FieldDefDocument[]> {
    const filter: any = { entity, isArchived: false };

    if (entity === EntityType.DEAL && context.pipelineId) {
      filter.$or = [{ pipelineIds: [] }, { pipelineIds: context.pipelineId }];
    }

    const fields = await TenantContext.run(workspaceId, () =>
      this.fieldDefModel.find(filter).sort({ order: 1 }).exec(),
    );

    if (context.roleId) {
      return fields.filter((f) => {
        if (f.visibleRoleIds.length === 0) return true;
        return f.visibleRoleIds.includes(context.roleId!);
      });
    }

    return fields;
  }

  async validateAndNormalize(
    entity: EntityTypeType,
    values: Record<string, unknown>,
    context: ValidationContext & { workspaceId: string },
  ): Promise<Record<string, unknown>> {
    const fields = await this.getApplicableFields(entity, context, context.workspaceId);
    const fieldMap = new Map(fields.map((f) => [f.code, f]));
    const normalized: Record<string, unknown> = {};

    for (const [code, value] of Object.entries(values)) {
      const field = fieldMap.get(code);
      if (!field) continue;

      if (!this.canViewField(field, context.roleId)) {
        continue;
      }

      if (context.mode === 'update' && !this.canEditField(field, context.roleId)) {
        throw new BadRequestException(`FIELD_NOT_EDITABLE: ${code}`);
      }

      normalized[code] = this.normalizeFieldValue(field, value);
    }

    if (context.mode === 'create') {
      for (const field of fields) {
        if (field.isRequired && !normalized[field.code]) {
          throw new BadRequestException(`REQUIRED_FIELDS: ${field.code}`);
        }
      }
    }

    return normalized;
  }

  async checkRequiredForStage(
    stageId: string,
    dealValues: Record<string, unknown>,
    workspaceId: string,
  ): Promise<string[]> {
    const missing: string[] = [];

    return missing;
  }

  private canViewField(field: FieldDefDocument, roleId?: string): boolean {
    if (!roleId || field.visibleRoleIds.length === 0) return true;
    return field.visibleRoleIds.includes(roleId);
  }

  private canEditField(field: FieldDefDocument, roleId?: string): boolean {
    if (!roleId) return true;
    if (field.editableRoleIds.length === 0) return this.canViewField(field, roleId);
    return field.editableRoleIds.includes(roleId);
  }

  private normalizeFieldValue(field: FieldDefDocument, value: unknown): unknown {
    switch (field.type) {
      case FieldType.NUMBER:
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException(`Invalid number for field ${field.code}`);
        }
        return value;

      case FieldType.SWITCH:
        if (typeof value !== 'boolean') {
          throw new BadRequestException(`Invalid boolean for field ${field.code}`);
        }
        return value;

      case FieldType.SELECT:
        if (typeof value !== 'string') {
          throw new BadRequestException(`Invalid select value for field ${field.code}`);
        }
        const option = field.options.find((o) => o.id === value && !o.isArchived);
        if (!option) {
          throw new BadRequestException(`Invalid option for field ${field.code}`);
        }
        return value;

      case FieldType.MULTISELECT:
        if (!Array.isArray(value)) {
          throw new BadRequestException(`Invalid multiselect value for field ${field.code}`);
        }
        for (const v of value) {
          if (typeof v !== 'string') {
            throw new BadRequestException(`Invalid multiselect value for field ${field.code}`);
          }
          const opt = field.options.find((o) => o.id === v && !o.isArchived);
          if (!opt) {
            throw new BadRequestException(`Invalid option for field ${field.code}`);
          }
        }
        return value;

      case FieldType.DATE:
      case FieldType.DATETIME:
        if (typeof value !== 'string' || !this.isValidISODate(value)) {
          throw new BadRequestException(`Invalid date for field ${field.code}`);
        }
        return value;

      case FieldType.URL:
        if (typeof value !== 'string' || !this.isValidUrl(value)) {
          throw new BadRequestException(`Invalid URL for field ${field.code}`);
        }
        return value;

      case FieldType.EMAIL:
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          throw new BadRequestException(`Invalid email for field ${field.code}`);
        }
        return value;

      case FieldType.PHONE:
        if (typeof value !== 'string') {
          throw new BadRequestException(`Invalid phone for field ${field.code}`);
        }
        return this.normalizePhone(value);

      case FieldType.TEXT:
      case FieldType.TEXTAREA:
      case FieldType.ADDRESS:
        if (typeof value !== 'string') {
          throw new BadRequestException(`Invalid text for field ${field.code}`);
        }
        if (value.length > 10000) {
          throw new BadRequestException(`Text too long for field ${field.code}`);
        }
        return value;

      default:
        return value;
    }
  }

  private isValidISODate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('998')) {
      return `+${digits}`;
    }
    if (digits.length === 9) {
      return `+998${digits}`;
    }
    throw new BadRequestException('Invalid phone number format');
  }
}
