import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';
import { EntityType, type EntityTypeType } from '../../common/constants/entity-types';

export const FieldType = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SWITCH: 'switch',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATE: 'date',
  DATETIME: 'datetime',
  URL: 'url',
  PHONE: 'phone',
  EMAIL: 'email',
  ADDRESS: 'address',
} as const;

export type FieldTypeType = (typeof FieldType)[keyof typeof FieldType];

export interface FieldOption {
  id: string;
  label: string;
  order: number;
  isArchived: boolean;
}

export type FieldDefDocument = HydratedDocument<FieldDef> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class FieldDef {
  @Prop({ required: true, enum: Object.values(EntityType) })
  entity!: EntityTypeType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true, enum: Object.values(FieldType) })
  type!: FieldTypeType;

  @Prop({ type: [{ id: String, label: String, order: Number, isArchived: Boolean }], default: [] })
  options!: FieldOption[];

  @Prop({ type: Types.ObjectId, ref: 'FieldGroup' })
  groupId?: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ default: false })
  isRequired!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Pipeline', default: [] })
  pipelineIds!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
  visibleRoleIds!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Role', default: [] })
  editableRoleIds!: string[];

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const FieldDefSchema = SchemaFactory.createForClass(FieldDef);
