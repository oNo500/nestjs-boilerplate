import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { Public } from '@/common/decorators';

import { HealthService } from './health.service';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('test')
  healthCheck() {
    return 'Http working fine';
  }
  @Get()
  async check() {
    return await this.healthService.check();
  }
}
