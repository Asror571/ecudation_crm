import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stage, StageDocument, StageType, type StageTypeType } from './schemas/stage.schema';
import { PipelineUsageRegistry } from './pipeline-usage-registry';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class StagesService {
  constructor(
    @InjectModel(Stage.name) private stageModel: Model<StageDocument>,
    private usageRegistry: PipelineUsageRegistry,
  ) {}

  async create(
    pipelineId: string,
    name: string,
    type: StageTypeType,
    workspaceId: string,
    color?: string,
  ): Promise<StageDocument> {
    const pipelineStages = await TenantContext.run(workspaceId, () =>
      this.stageModel.find({ pipelineId }).sort({ order: 1 }).exec(),
    );

    const hasIncoming = pipelineStages.some((s) => s.type === StageType.INCOMING);
    const hasWon = pipelineStages.some((s) => s.type === StageType.WON);
    const hasLost = pipelineStages.some((s) => s.type === StageType.LOST);

    if (type === StageType.INCOMING && hasIncoming) {
      throw new BadRequestException('Pipeline already has an incoming stage');
    }

    let order = pipelineStages.length;
    if (type === StageType.WON) {
      if (!hasLost) {
        order = pipelineStages.length;
      } else {
        const lostOrder = pipelineStages.find((s) => s.type === StageType.LOST)!.order;
        order = lostOrder;
        await this.shiftStagesAfter(lostOrder, pipelineId, workspaceId);
      }
    } else if (type === StageType.LOST) {
      order = pipelineStages.length;
    } else if (type === StageType.OPEN) {
      if (hasWon) {
        const wonOrder = pipelineStages.find((s) => s.type === StageType.WON)!.order;
        order = wonOrder;
        await this.shiftStagesAfter(wonOrder, pipelineId, workspaceId);
      } else if (hasLost) {
        const lostOrder = pipelineStages.find((s) => s.type === StageType.LOST)!.order;
        order = lostOrder;
        await this.shiftStagesAfter(lostOrder, pipelineId, workspaceId);
      }
    }

    const stage = new this.stageModel({
      pipelineId,
      name,
      type,
      order,
      color: color || '#2563EB',
      workspaceId,
    });

    return TenantContext.run(workspaceId, () => stage.save());
  }

  async findById(id: string, workspaceId: string): Promise<StageDocument | null> {
    return TenantContext.run(workspaceId, () => this.stageModel.findById(id).exec());
  }

  async findByPipeline(pipelineId: string, workspaceId: string): Promise<StageDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.stageModel.find({ pipelineId }).sort({ order: 1 }).exec(),
    );
  }

  async update(
    id: string,
    updateData: Partial<Stage>,
    workspaceId: string,
  ): Promise<StageDocument> {
    const stage = await this.findById(id, workspaceId);
    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    if (updateData.type && updateData.type !== stage.type) {
      throw new BadRequestException('Cannot change stage type');
    }

    return TenantContext.run(workspaceId, () =>
      this.stageModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );
  }

  async delete(id: string, workspaceId: string, moveDealsToStageId?: string): Promise<void> {
    const stage = await this.findById(id, workspaceId);
    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    if (stage.type === StageType.INCOMING) {
      throw new BadRequestException('Cannot delete incoming stage');
    }

    const pipelineStages = await this.findByPipeline(stage.pipelineId, workspaceId);
    const incomingCount = pipelineStages.filter((s) => s.type === StageType.INCOMING).length;
    const wonCount = pipelineStages.filter((s) => s.type === StageType.WON).length;
    const lostCount = pipelineStages.filter((s) => s.type === StageType.LOST).length;

    if (stage.type === StageType.WON && wonCount === 1) {
      throw new BadRequestException('Pipeline must have at least one won stage');
    }

    if (stage.type === StageType.LOST && lostCount === 1) {
      throw new BadRequestException('Pipeline must have at least one lost stage');
    }

    const usage = await this.usageRegistry.getStageUsage([id]);
    if (usage.get(id) !== undefined && usage.get(id)! > 0) {
      if (!moveDealsToStageId) {
        throw new BadRequestException('Stage has active deals, specify moveDealsToStageId');
      }
    }

    await TenantContext.run(workspaceId, () => this.stageModel.findByIdAndDelete(id).exec());
  }

  async reorder(
    stageIds: string[],
    pipelineId: string,
    workspaceId: string,
  ): Promise<StageDocument[]> {
    const stages = await TenantContext.run(workspaceId, () =>
      this.stageModel.find({ _id: { $in: stageIds }, pipelineId }).exec(),
    );

    if (stages.length !== stageIds.length) {
      throw new BadRequestException('Invalid stage IDs');
    }

    await this.validateStageOrder(stageIds, stages, workspaceId);

    for (let i = 0; i < stageIds.length; i++) {
      await TenantContext.run(workspaceId, () =>
        this.stageModel.findByIdAndUpdate(stageIds[i], { order: i }).exec(),
      );
    }

    return this.findByPipeline(pipelineId, workspaceId);
  }

  async updateRequiredFields(
    id: string,
    requiredFieldIds: string[],
    workspaceId: string,
  ): Promise<StageDocument> {
    const stage = await this.findById(id, workspaceId);
    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    return TenantContext.run(workspaceId, () =>
      this.stageModel.findByIdAndUpdate(id, { requiredFieldIds }, { new: true }).exec(),
    );
  }

  private async shiftStagesAfter(
    order: number,
    pipelineId: string,
    workspaceId: string,
  ): Promise<void> {
    await TenantContext.run(workspaceId, () =>
      this.stageModel
        .updateMany({ pipelineId, order: { $gte: order } }, { $inc: { order: 1 } })
        .exec(),
    );
  }

  private async validateStageOrder(
    stageIds: string[],
    stages: StageDocument[],
    workspaceId: string,
  ): Promise<void> {
    const stageMap = new Map(stages.map((s) => [s._id.toString(), s]));
    const pipelineId = stages[0]?.pipelineId;

    const incomingIndex = stageIds.findIndex(
      (id) => stageMap.get(id)?.type === StageType.INCOMING,
    );
    if (incomingIndex !== 0) {
      throw new BadRequestException('Incoming stage must be first');
    }

    const wonIndex = stageIds.findIndex(
      (id) => stageMap.get(id)?.type === StageType.WON,
    );
    const lostIndex = stageIds.findIndex(
      (id) => stageMap.get(id)?.type === StageType.LOST,
    );

    if (wonIndex !== -1 && lostIndex !== -1 && wonIndex > lostIndex) {
      throw new BadRequestException('Won stage must come before lost stage');
    }

    if (wonIndex !== -1) {
      for (let i = wonIndex + 1; i < stageIds.length; i++) {
        const type = stageMap.get(stageIds[i])?.type;
        if (type === StageType.OPEN) {
          throw new BadRequestException('Open stages cannot come after won stage');
        }
      }
    }
  }
}
