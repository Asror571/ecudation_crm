import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';
import { EntityType, type EntityTypeType } from '../../common/constants/entity-types';

export type FieldGroupDocument = HydratedDocument<FieldGroup> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class FieldGroup {
  @Prop({ required: true, enum: Object.values(EntityType) })
  entity!: EntityTypeType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ default: false })
  collapsedByDefault!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const FieldGroupSchema = SchemaFactory.createForClass(FieldGroup);
