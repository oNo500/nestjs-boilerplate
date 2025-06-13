import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { Public } from '@/common/decorators';

import { HealthService } from './health.service';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  async healthCheck() {
    return await this.healthService.drizzleIsHealth();
  }
}
