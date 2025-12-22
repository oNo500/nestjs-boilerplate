import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

import { createLoggerConfig } from './logger.config'

import type { Env } from '@/app/config/env.schema'

/**
 * Logger module - high-performance structured logging with Pino
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
