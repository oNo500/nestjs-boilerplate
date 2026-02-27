import KeyvRedis from '@keyv/redis'
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'
import { CacheService } from '@/modules/cache/application/services/cache.service'

import type { Env } from '@/app/config/env.schema'

/**
 * Cache module
 *
 * Provides a caching service backed by Redis (via the Keyv adapter)
 * This is an example of the "thin application layer" pattern:
 * - primarily integrates third-party libraries (cache-manager + @keyv/redis)
 * - the service layer acts only as a coordinator with no complex business logic
 * - uses port/adapter pattern for easy replacement of the cache implementation
 */
@Module({
  imports: [
    // Configure cache-manager to use Redis (via the Keyv adapter)
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Env, true>) => {
        const url = configService.get('REDIS_URL', { infer: true })
        const ttl = configService.get('REDIS_TTL', { infer: true })

        return {
          stores: [new KeyvRedis(url)],
          ttl: ttl * 1000,
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    CacheService,

    // Provide CachePort interface (DIP)
    {
      provide: CACHE_PORT,
      useExisting: CacheService,
    },
  ],
  exports: [
    CacheService,
    CACHE_PORT,
  ],
})
export class CacheModule {}
