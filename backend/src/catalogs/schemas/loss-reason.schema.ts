import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export type LossReasonDocument = HydratedDocument<LossReason> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class LossReason {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  order!: number;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;
}

export const LossReasonSchema = SchemaFactory.createForClass(LossReason);
