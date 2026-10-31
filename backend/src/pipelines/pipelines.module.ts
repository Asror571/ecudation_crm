import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PipelinesService } from './pipelines.service';
import { StagesService } from './stages.service';
import { PipelineAccessService } from './pipeline-access.service';
import { PipelineUsageRegistry } from './pipeline-usage-registry';
import { Pipeline, PipelineSchema } from './schemas/pipeline.schema';
import { Stage, StageSchema } from './schemas/stage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Stage.name, schema: StageSchema },
    ]),
  ],
  providers: [
    PipelinesService,
    StagesService,
    PipelineAccessService,
    PipelineUsageRegistry,
  ],
  exports: [
    PipelinesService,
    StagesService,
    PipelineAccessService,
    PipelineUsageRegistry,
  ],
})
export class PipelinesModule {}
