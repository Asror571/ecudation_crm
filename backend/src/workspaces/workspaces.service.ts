import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Workspace,
  type WorkspaceDocument,
} from './schemas/workspace.schema';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(name: string, slug: string): Promise<WorkspaceDocument> {
    const existingWorkspace = await this.workspaceModel
      .findOne({
        $or: [{ name }, { slug }],
      })
      .exec();

    if (existingWorkspace) {
      throw new ConflictException(
        'Workspace with this name or slug already exists',
      );
    }

    const workspace = new this.workspaceModel({ name, slug });
    return workspace.save();
  }

  async findById(id: string): Promise<WorkspaceDocument | null> {
    return this.workspaceModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<WorkspaceDocument | null> {
    return this.workspaceModel.findOne({ slug }).exec();
  }

  async findAll(): Promise<WorkspaceDocument[]> {
    return this.workspaceModel.find().exec();
  }

  async update(
    id: string,
    updateData: Partial<Workspace>,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async delete(id: string): Promise<void> {
    const result = await this.workspaceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Workspace not found');
    }
  }
}
