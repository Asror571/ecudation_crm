import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role> & { _id: Types.ObjectId };

export interface Rights {
  deals: { view: string; add: string; edit: string; delete: string; export: string };
  contacts: { view: string; add: string; edit: string; delete: string; export: string };
  companies: { view: string; add: string; edit: string; delete: string; export: string };
  tasks: { view: string; add: string; edit: string; delete: string };
  conversations: { view: string; add: string; edit: string; delete: string };
  analytics: string;
  settings: {
    pipelines: boolean;
    fields: boolean;
    users: boolean;
    integrations: boolean;
    templates: boolean;
    api: boolean;
  };
  canExportAll: boolean;
  canSeeUnsorted: boolean;
}

export interface PipelineAccess {
  [pipelineId: string]: 'none' | 'view' | 'edit';
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;

  @Prop({ required: true, type: Object })
  rights!: Rights;

  @Prop({ type: Object, default: {} })
  pipelineAccess!: PipelineAccess;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
