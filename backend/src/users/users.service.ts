import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await TenantContext.runWithoutTenant(
      'global_email_uniqueness_check',
      () => this.userModel.findOne({ email: createUserDto.email }).exec(),
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return TenantContext.run(createUserDto.workspaceId, () => user.save());
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return TenantContext.runWithoutTenant('authentication_email_lookup', () =>
      this.userModel.findOne({ email }).exec(),
    );
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<UserDocument | null> {
    return TenantContext.run(workspaceId, () =>
      this.userModel.findById(id).exec(),
    );
  }

  async findAll(workspaceId: string): Promise<UserDocument[]> {
    return TenantContext.run(workspaceId, () => this.userModel.find().exec());
  }

  async update(
    id: string,
    updateData: Partial<User>,
    workspaceId: string,
  ): Promise<UserDocument> {
    const user = await TenantContext.run(workspaceId, () =>
      this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateRefreshToken(
    userId: string,
    workspaceId: string,
    refreshToken: string,
  ): Promise<void> {
    await TenantContext.run(workspaceId, () =>
      this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec(),
    );
  }

  async removeRefreshToken(userId: string, workspaceId: string): Promise<void> {
    await TenantContext.run(workspaceId, () =>
      this.userModel.findByIdAndUpdate(userId, { refreshToken: null }).exec(),
    );
  }

  async updateLastLogin(userId: string, workspaceId: string): Promise<void> {
    await TenantContext.run(workspaceId, () =>
      this.userModel
        .findByIdAndUpdate(userId, { lastLoginAt: new Date() })
        .exec(),
    );
  }
}
