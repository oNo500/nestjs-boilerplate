import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { DB_TOKEN } from './db.port'
import { createDrizzleInstance } from './db.provider'

import type { DrizzleAsyncOptions } from './db.port'
import type { Env } from '@/app/config/env.schema'
import type { DynamicModule } from '@nestjs/common'

/**
 * Drizzle database module
 *
 * Uses the Dynamic Module pattern, similar to @nestjs/typeorm
 * - forRoot(): configure with the default ConfigService
 * - forRootAsync(): configure with a custom factory function
 */
@Global()
@Module({})
export class DrizzleModule {
  /**
   * Create the global database connection using the default ConfigService.
   * Should be called once in AppModule.
   */
  static forRoot(): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DB_TOKEN,
          inject: [ConfigService],
          useFactory: (configService: ConfigService<Env, true>) => {
            return createDrizzleInstance({
              connectionString: configService.get('DATABASE_URL', {
                infer: true,
              }),
              pool: {
                max: configService.get('DB_POOL_MAX', { infer: true }),
                min: configService.get('DB_POOL_MIN', { infer: true }),
                idleTimeoutMillis: configService.get('DB_POOL_IDLE_TIMEOUT', {
                  infer: true,
                }),
                connectionTimeoutMillis: configService.get(
                  'DB_POOL_CONNECTION_TIMEOUT',
                  { infer: true },
                ),
              },
            })
          },
        },
      ],
      exports: [DB_TOKEN],
    }
  }

  /**
   * Create the global database connection using a custom factory function.
   * Use this when more flexible configuration is needed.
   *
   * @example
   * DrizzleModule.forRootAsync({
   *   imports: [ConfigModule],
   *   inject: [ConfigService],
   *   useFactory: (config: ConfigService) => ({
   *     connectionString: config.get('DATABASE_URL'),
   *     pool: { max: 20 },
   *   }),
   * })
   */
  static forRootAsync(options: DrizzleAsyncOptions): DynamicModule {
    return {
      module: DrizzleModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: DB_TOKEN,
          inject: options.inject ?? [],
          useFactory: async (...args: unknown[]) => {
            const moduleOptions = await options.useFactory(...args)
            return createDrizzleInstance(moduleOptions)
          },
        },
      ],
      exports: [DB_TOKEN],
    }
  }
}
