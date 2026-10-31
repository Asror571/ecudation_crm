import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogsService } from './catalogs.service';
import { Tag, TagSchema } from './schemas/tag.schema';
import { TaskType, TaskTypeSchema } from './schemas/task-type.schema';
import { LossReason, LossReasonSchema } from './schemas/loss-reason.schema';
import { Course, CourseSchema } from './schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: TaskType.name, schema: TaskTypeSchema },
      { name: LossReason.name, schema: LossReasonSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
