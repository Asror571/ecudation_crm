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

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({
        email: createUserDto.email,
      })
      .setOptions({ skipWorkspaceFilter: true })
      .exec();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .setOptions({ skipWorkspaceFilter: true })
      .exec();
  }

  async findById(
    id: string,
    workspaceId?: string,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);
    query.setOptions(
      workspaceId
        ? { workspaceId, skipWorkspaceFilter: false }
        : { skipWorkspaceFilter: true },
    );
    return query.exec();
  }

  async findAll(workspaceId: string): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .setOptions({ workspaceId, skipWorkspaceFilter: false })
      .exec();
  }

  async update(
    id: string,
    updateData: Partial<User>,
    workspaceId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .setOptions({ workspaceId, skipWorkspaceFilter: false })
      .exec();

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
    refreshToken: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken })
      .setOptions({ skipWorkspaceFilter: true })
      .exec();
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: null })
      .setOptions({ skipWorkspaceFilter: true })
      .exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLoginAt: new Date() })
      .setOptions({ skipWorkspaceFilter: true })
      .exec();
  }
}
