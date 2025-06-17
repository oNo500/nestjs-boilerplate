import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, DrizzleHealthIndicator],
})
export class HealthModule {}
