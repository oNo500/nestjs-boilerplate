import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

import { createLoggerConfig } from './logger.config'

import type { Env } from '@/app/config/env.schema'

/**
 * Logger module
 *
 * Provides high-performance structured logging based on nestjs-pino
 *
 * Features:
 * - High-performance JSON logging (Pino)
 * - Automatic request context injection
 * - Automatic sensitive field redaction
 * - Environment-aware configuration
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => createLoggerConfig(config),
    }),
  ],
})
export class LoggerModule {}
