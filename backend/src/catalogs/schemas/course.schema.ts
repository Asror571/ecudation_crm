import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: 0 })
  price!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
