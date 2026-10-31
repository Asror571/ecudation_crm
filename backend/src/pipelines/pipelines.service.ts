import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pipeline, PipelineDocument } from './schemas/pipeline.schema';
import { Stage, StageDocument, StageType } from './schemas/stage.schema';
import { PipelineUsageRegistry } from './pipeline-usage-registry';
import { TenantContext } from '../common/tenant-context';
import type { RoleDocument } from '../roles/schemas/role.schema';
import type { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectModel(Pipeline.name) private pipelineModel: Model<PipelineDocument>,
    @InjectModel(Stage.name) private stageModel: Model<StageDocument>,
    private usageRegistry: PipelineUsageRegistry,
  ) {}

  async create(
    name: string,
    workspaceId: string,
    color?: string,
    groupIds?: string[],
  ): Promise<PipelineDocument> {
    const count = await TenantContext.run(workspaceId, () =>
      this.pipelineModel.countDocuments().exec(),
    );

    const pipeline = new this.pipelineModel({
      name,
      workspaceId,
      order: count,
      color: color || '#2563EB',
      groupIds: groupIds || [],
      isDefault: count === 0,
    });

    const saved = await TenantContext.run(workspaceId, () => pipeline.save());

    await this.createDefaultStages(saved._id.toString(), workspaceId);

    return saved;
  }

  async findById(id: string, workspaceId: string): Promise<PipelineDocument | null> {
    return TenantContext.run(workspaceId, () =>
      this.pipelineModel.findById(id).exec(),
    );
  }

  async findAll(workspaceId: string): Promise<PipelineDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.pipelineModel.find({ isDeleted: false }).sort({ order: 1 }).exec(),
    );
  }

  async update(
    id: string,
    updateData: Partial<Pipeline>,
    workspaceId: string,
  ): Promise<PipelineDocument> {
    const pipeline = await TenantContext.run(workspaceId, () =>
      this.pipelineModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    if (updateData.isDefault === true) {
      await TenantContext.run(workspaceId, () =>
        this.pipelineModel
          .updateMany({ _id: { $ne: id } }, { isDefault: false })
          .exec(),
      );
    }

    return pipeline;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const pipeline = await this.findById(id, workspaceId);
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const count = await TenantContext.run(workspaceId, () =>
      this.pipelineModel.countDocuments({ isDeleted: false }).exec(),
    );

    if (count === 1) {
      throw new BadRequestException('Cannot delete the last pipeline');
    }

    const usage = await this.usageRegistry.getPipelineUsage([id]);
    if (usage.get(id) !== undefined && usage.get(id)! > 0) {
      throw new BadRequestException('Cannot delete pipeline with active deals');
    }

    await TenantContext.run(workspaceId, () =>
      this.pipelineModel.findByIdAndUpdate(id, { isDeleted: true }).exec(),
    );
  }

  async reorder(
    pipelineIds: string[],
    workspaceId: string,
  ): Promise<PipelineDocument[]> {
    const pipelines = await TenantContext.run(workspaceId, () =>
      this.pipelineModel
        .find({ _id: { $in: pipelineIds }, isDeleted: false })
        .exec(),
    );

    if (pipelines.length !== pipelineIds.length) {
      throw new BadRequestException('Invalid pipeline IDs');
    }

    for (let i = 0; i < pipelineIds.length; i++) {
      await TenantContext.run(workspaceId, () =>
        this.pipelineModel
          .findByIdAndUpdate(pipelineIds[i], { order: i })
          .exec(),
      );
    }

    return this.findAll(workspaceId);
  }

  private async createDefaultStages(
    pipelineId: string,
    workspaceId: string,
  ): Promise<void> {
    const stages = [
      { name: 'Tahlil qilinmagan', type: StageType.INCOMING, color: '#6B7280', order: 0 },
      { name: 'Yangi lid', type: StageType.OPEN, color: '#3B82F6', order: 1 },
      { name: 'Yutildi', type: StageType.WON, color: '#10B981', order: 2 },
      { name: 'Yo\'qotildi', type: StageType.LOST, color: '#EF4444', order: 3 },
    ];

    for (const stage of stages) {
      const s = new this.stageModel({
        pipelineId,
        ...stage,
        workspaceId,
      });
      await TenantContext.run(workspaceId, () => s.save());
    }
  }
}
