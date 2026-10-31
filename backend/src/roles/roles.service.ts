import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, Rights, PipelineAccess } from './schemas/role.schema';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(name: string, rights: Rights, workspaceId: string, pipelineAccess?: PipelineAccess): Promise<RoleDocument> {
    const role = new this.roleModel({ name, workspaceId, rights, pipelineAccess });
    return TenantContext.run(workspaceId, () => role.save());
  }

  async findById(id: string, workspaceId: string): Promise<RoleDocument | null> {
    return TenantContext.run(workspaceId, () => this.roleModel.findById(id).exec());
  }

  async findByName(name: string, workspaceId: string): Promise<RoleDocument | null> {
    return TenantContext.run(workspaceId, () => this.roleModel.findOne({ name }).exec());
  }

  async findAll(workspaceId: string): Promise<RoleDocument[]> {
    return TenantContext.run(workspaceId, () => this.roleModel.find().exec());
  }

  async update(id: string, updateData: Partial<Role>, workspaceId: string): Promise<RoleDocument> {
    const role = await TenantContext.run(workspaceId, () =>
      this.roleModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const result = await TenantContext.run(workspaceId, () =>
      this.roleModel.findByIdAndDelete(id).exec(),
    );

    if (!result) {
      throw new NotFoundException('Role not found');
    }
  }
}
