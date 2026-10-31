import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type PipelineDocument = HydratedDocument<Pipeline> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Pipeline {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ required: true })
  color!: string;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Group', default: [] })
  groupIds!: string[];

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline);
