import { Injectable } from '@nestjs/common';

export interface UsageChecker {
  countPipelines(pipelineIds: string[]): Promise<Map<string, number>>;
  countStages(stageIds: string[]): Promise<Map<string, number>>;
}

@Injectable()
export class PipelineUsageRegistry {
  private checkers: UsageChecker[] = [];

  register(checker: UsageChecker): void {
    this.checkers.push(checker);
  }

  async getPipelineUsage(pipelineIds: string[]): Promise<Map<string, number>> {
    const combined = new Map<string, number>();
    for (const checker of this.checkers) {
      const counts = await checker.countPipelines(pipelineIds);
      for (const [id, count] of counts.entries()) {
        combined.set(id, (combined.get(id) || 0) + count);
      }
    }
    return combined;
  }

  async getStageUsage(stageIds: string[]): Promise<Map<string, number>> {
    const combined = new Map<string, number>();
    for (const checker of this.checkers) {
      const counts = await checker.countStages(stageIds);
      for (const [id, count] of counts.entries()) {
        combined.set(id, (combined.get(id) || 0) + count);
      }
    }
    return combined;
  }
}
