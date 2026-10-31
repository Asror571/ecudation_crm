import { Controller, Get, Post, UseGuards, Req, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { EducationTemplateService } from './education-template';
import type { AuthenticatedRequest } from '../auth/types';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private educationTemplateService: EducationTemplateService,
  ) {}

  @Get('bootstrap')
  async getBootstrap(@Req() request: AuthenticatedRequest) {
    return this.settingsService.getBootstrap(
      request.user.id,
      request.user.workspaceId,
    );
  }

  @Post('templates/education/apply')
  @HttpCode(HttpStatus.OK)
  async applyEducationTemplate(
    @Req() request: AuthenticatedRequest,
    @Body() body: { branches?: string[] },
  ) {
    return this.educationTemplateService.applyEducationTemplate(
      request.user.workspaceId,
      body,
    );
  }
}
