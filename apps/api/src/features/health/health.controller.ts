import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  async healthCheck() {
    return await this.healthService.drizzleIsHealth();
  }
}
