import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import type { AppInfo, HealthResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): AppInfo {
    return this.appService.getInfo();
  }

  @Get('health')
  getHealth(): HealthResponse {
    const health = this.appService.getHealth();

    if (health.status !== 'ok') {
      throw new ServiceUnavailableException(health);
    }

    return health;
  }
}
