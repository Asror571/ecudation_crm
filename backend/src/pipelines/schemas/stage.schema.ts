import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export const StageType = {
  INCOMING: 'incoming',
  OPEN: 'open',
  WON: 'won',
  LOST: 'lost',
} as const;

export type StageTypeType = (typeof StageType)[keyof typeof StageType];

export type StageDocument = HydratedDocument<Stage> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Stage {
  @Prop({ required: true, ref: 'Pipeline' })
  pipelineId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ required: true, enum: Object.values(StageType) })
  type!: StageTypeType;

  @Prop({ type: [Types.ObjectId], ref: 'FieldDef', default: [] })
  requiredFieldIds!: string[];

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const StageSchema = SchemaFactory.createForClass(Stage);
