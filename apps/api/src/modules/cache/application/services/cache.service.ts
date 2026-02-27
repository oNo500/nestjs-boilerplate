import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'

import type { CachePort } from '@/modules/cache/application/ports/cache.port'
import type { Cache } from 'cache-manager'

@Injectable()
export class CacheService implements CachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // cache-manager v5+ uses milliseconds
    const ttlMs = ttl ? ttl * 1000 : undefined
    await this.cacheManager.set(key, value, ttlMs)
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear()
  }

  async wrap<T>(key: string, function_: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    const result = await function_()
    await this.set(key, result, ttl)
    return result
  }
}
