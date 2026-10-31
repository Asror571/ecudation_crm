import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type GroupDocument = HydratedDocument<Group> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  parentId?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
