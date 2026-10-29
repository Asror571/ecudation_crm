import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  WORKSPACE_SUPER_ADMIN: 'workspace_super_admin',
  ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export type UserDocument = HydratedDocument<User> & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: Object.values(UserRole) })
  role!: UserRoleType;

  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop()
  phoneNumber?: string;

  @Prop()
  avatar?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
