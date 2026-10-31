import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument, EntityType, type EntityTypeType } from './schemas/tag.schema';
import { TaskType, TaskTypeDocument } from './schemas/task-type.schema';
import { LossReason, LossReasonDocument } from './schemas/loss-reason.schema';
import { Course, CourseDocument } from './schemas/course.schema';
import { TenantContext } from '../common/tenant-context';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(TaskType.name) private taskTypeModel: Model<TaskTypeDocument>,
    @InjectModel(LossReason.name) private lossReasonModel: Model<LossReasonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async createTag(
    entity: EntityTypeType,
    name: string,
    color: string,
    workspaceId: string,
  ): Promise<TagDocument> {
    const existing = await TenantContext.run(workspaceId, () =>
      this.tagModel.findOne({ entity, name: new RegExp(`^${name}$`, 'i') }).exec(),
    );

    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = new this.tagModel({ entity, name, color, workspaceId });
    return TenantContext.run(workspaceId, () => tag.save());
  }

  async findTags(entity: EntityTypeType, workspaceId: string): Promise<TagDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.tagModel.find({ entity }).exec(),
    );
  }

  async updateTag(
    id: string,
    updateData: Partial<Tag>,
    workspaceId: string,
  ): Promise<TagDocument> {
    const tag = await TenantContext.run(workspaceId, () =>
      this.tagModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async deleteTag(id: string, workspaceId: string): Promise<void> {
    const result = await TenantContext.run(workspaceId, () =>
      this.tagModel.findByIdAndDelete(id).exec(),
    );

    if (!result) {
      throw new NotFoundException('Tag not found');
    }
  }

  async createTaskType(
    name: string,
    icon: string,
    defaultDeadlineMinutes: number,
    workspaceId: string,
  ): Promise<TaskTypeDocument> {
    const taskType = new this.taskTypeModel({
      name,
      icon,
      defaultDeadlineMinutes,
      workspaceId,
    });
    return TenantContext.run(workspaceId, () => taskType.save());
  }

  async findTaskTypes(workspaceId: string): Promise<TaskTypeDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.taskTypeModel.find().exec(),
    );
  }

  async updateTaskType(
    id: string,
    updateData: Partial<TaskType>,
    workspaceId: string,
  ): Promise<TaskTypeDocument> {
    const taskType = await TenantContext.run(workspaceId, () =>
      this.taskTypeModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!taskType) {
      throw new NotFoundException('Task type not found');
    }

    return taskType;
  }

  async archiveTaskType(id: string, workspaceId: string): Promise<TaskTypeDocument> {
    const taskType = await TenantContext.run(workspaceId, () =>
      this.taskTypeModel.findById(id).exec(),
    );

    if (!taskType) {
      throw new NotFoundException('Task type not found');
    }

    const activeCount = await TenantContext.run(workspaceId, () =>
      this.taskTypeModel.countDocuments({ isArchived: false }).exec(),
    );

    if (activeCount === 1 && !taskType.isArchived) {
      throw new BadRequestException('At least one active task type must remain');
    }

    taskType.isArchived = !taskType.isArchived;
    return TenantContext.run(workspaceId, () => taskType.save());
  }

  async createLossReason(
    name: string,
    workspaceId: string,
  ): Promise<LossReasonDocument> {
    const count = await TenantContext.run(workspaceId, () =>
      this.lossReasonModel.countDocuments().exec(),
    );

    const lossReason = new this.lossReasonModel({
      name,
      workspaceId,
      order: count,
    });
    return TenantContext.run(workspaceId, () => lossReason.save());
  }

  async findLossReasons(workspaceId: string): Promise<LossReasonDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.lossReasonModel.find().sort({ order: 1 }).exec(),
    );
  }

  async updateLossReason(
    id: string,
    updateData: Partial<LossReason>,
    workspaceId: string,
  ): Promise<LossReasonDocument> {
    const lossReason = await TenantContext.run(workspaceId, () =>
      this.lossReasonModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!lossReason) {
      throw new NotFoundException('Loss reason not found');
    }

    return lossReason;
  }

  async archiveLossReason(id: string, workspaceId: string): Promise<LossReasonDocument> {
    const lossReason = await TenantContext.run(workspaceId, () =>
      this.lossReasonModel.findById(id).exec(),
    );

    if (!lossReason) {
      throw new NotFoundException('Loss reason not found');
    }

    lossReason.isArchived = !lossReason.isArchived;
    return TenantContext.run(workspaceId, () => lossReason.save());
  }

  async reorderLossReasons(
    lossReasonIds: string[],
    workspaceId: string,
  ): Promise<LossReasonDocument[]> {
    const lossReasons = await TenantContext.run(workspaceId, () =>
      this.lossReasonModel.find({ _id: { $in: lossReasonIds } }).exec(),
    );

    if (lossReasons.length !== lossReasonIds.length) {
      throw new BadRequestException('Invalid loss reason IDs');
    }

    for (let i = 0; i < lossReasonIds.length; i++) {
      await TenantContext.run(workspaceId, () =>
        this.lossReasonModel.findByIdAndUpdate(lossReasonIds[i], { order: i }).exec(),
      );
    }

    return this.findLossReasons(workspaceId);
  }

  async createCourse(
    name: string,
    price: number,
    workspaceId: string,
  ): Promise<CourseDocument> {
    const course = new this.courseModel({ name, price, workspaceId });
    return TenantContext.run(workspaceId, () => course.save());
  }

  async findCourses(workspaceId: string): Promise<CourseDocument[]> {
    return TenantContext.run(workspaceId, () =>
      this.courseModel.find().exec(),
    );
  }

  async updateCourse(
    id: string,
    updateData: Partial<Course>,
    workspaceId: string,
  ): Promise<CourseDocument> {
    const course = await TenantContext.run(workspaceId, () =>
      this.courseModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async archiveCourse(id: string, workspaceId: string): Promise<CourseDocument> {
    const course = await TenantContext.run(workspaceId, () =>
      this.courseModel.findById(id).exec(),
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.isActive = !course.isActive;
    return TenantContext.run(workspaceId, () => course.save());
  }
}
