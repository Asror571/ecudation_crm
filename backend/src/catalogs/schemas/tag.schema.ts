import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';
import { EntityType, type EntityTypeType } from '../../common/constants/entity-types';

export type TagDocument = HydratedDocument<Tag> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, enum: Object.values(EntityType) })
  entity!: EntityTypeType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

export { EntityType, EntityTypeType };
