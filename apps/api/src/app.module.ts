import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@/common/modules/logger/logger.module';
import { HealthModule } from '@/features/health/health.module';
import { validateEnv } from '@/config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule,
    HealthModule,
  ],
})
export class AppModule {}
