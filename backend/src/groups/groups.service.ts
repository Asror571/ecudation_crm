import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class GroupsService {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {}

  async create(name: string, workspaceId: string, parentId?: string): Promise<GroupDocument> {
    const group = new this.groupModel({ name, parentId });
    return TenantContext.run(workspaceId, () => group.save());
  }

  async findById(id: string, workspaceId: string): Promise<GroupDocument | null> {
    return TenantContext.run(workspaceId, () => this.groupModel.findById(id).exec());
  }

  async findAll(workspaceId: string): Promise<GroupDocument[]> {
    return TenantContext.run(workspaceId, () => this.groupModel.find().exec());
  }

  async update(id: string, updateData: Partial<Group>, workspaceId: string): Promise<GroupDocument> {
    const group = await TenantContext.run(workspaceId, () =>
      this.groupModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const result = await TenantContext.run(workspaceId, () =>
      this.groupModel.findByIdAndDelete(id).exec(),
    );

    if (!result) {
      throw new NotFoundException('Group not found');
    }
  }
}
