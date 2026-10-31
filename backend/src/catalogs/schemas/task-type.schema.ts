import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type TaskTypeDocument = HydratedDocument<TaskType> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class TaskType {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ required: true })
  defaultDeadlineMinutes!: number;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const TaskTypeSchema = SchemaFactory.createForClass(TaskType);
