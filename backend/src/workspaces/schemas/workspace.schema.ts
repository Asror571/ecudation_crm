import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object, default: {} })
  settings?: {
    timezone?: string;
    language?: string;
  };
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
