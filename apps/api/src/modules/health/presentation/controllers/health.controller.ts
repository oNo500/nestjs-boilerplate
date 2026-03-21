import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'

import { DrizzleHealthIndicator } from '@/modules/health/infrastructure/drizzle.health'
import { RedisHealthIndicator } from '@/modules/health/infrastructure/redis.health'
import { Public } from '@/shared-kernel/infrastructure/decorators/public.decorator'

import type { Env } from '@/app/config/env.schema'

type HealthEntry = { status: 'up' | 'down', message: string }

/**
 * Health check controller
 */
@Public()
@Controller('health')
@ApiTags('health')
@SkipThrottle() // Health check endpoints are not rate-limited
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly drizzle: DrizzleHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Full health check',
    description: 'Checks database, memory, and disk health for production monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'All components are healthy',
    schema: {
      example: {
        environment: 'production',
        database: { status: 'up', message: 'Database is available' },
        redis: { status: 'up', message: 'Redis is available' },
        memory_heap: { status: 'up', message: 'Heap memory usage is within threshold' },
        memory_rss: { status: 'up', message: 'RSS memory usage is within threshold' },
        storage: { status: 'up', message: 'Disk usage is within threshold' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more components are unhealthy',
    schema: {
      example: {
        type: 'https://api.example.com/errors/service-unavailable',
        title: 'Service Unavailable',
        status: 503,
        instance: '/health',
        request_id: 'req_abc123',
        timestamp: '2024-11-03T10:30:00Z',
        errors: [
          {
            code: 'DATABASE_UNAVAILABLE',
            message: 'database: Connection refused',
          },
        ],
      },
    },
  })
  async check() {
    try {
      const result = await this.health.check([
        // Database health check
        () => this.drizzle.isHealthy('database'),

        // Redis health check
        () => this.redis.isHealthy('redis'),

        // Memory health check (heap must not exceed 150 MB)
        () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

        // Memory health check (RSS must not exceed 300 MB)
        () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

        // Disk health check (disk usage must not exceed 90%)
        () =>
          this.disk.checkStorage('storage', {
            path: '/',
            thresholdPercent: 0.9,
          }),
      ])
      const defaultMessages: Record<string, string> = {
        memory_heap: 'Heap memory usage is within threshold',
        memory_rss: 'RSS memory usage is within threshold',
        storage: 'Disk usage is within threshold',
      }

      const details: Record<string, HealthEntry> = {}
      for (const [key, value] of Object.entries(result.details)) {
        const status = value.status as 'up' | 'down'
        const message = typeof value.message === 'string'
          ? value.message
          : (defaultMessages[key] ?? 'OK')
        details[key] = { status, message }
      }

      const environment: Env['NODE_ENV'] = this.config.get('NODE_ENV')

      return {
        environment,
        ...details,
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        const response = error.getResponse() as Record<string, unknown>
        const detail = this.formatHealthCheckErrors(response.error)
        throw new ServiceUnavailableException(detail)
      }
      throw error
    }
  }

  /**
   * Format health check errors into a detail string
   */
  private formatHealthCheckErrors(errors: unknown): string {
    if (typeof errors !== 'object' || errors === null) {
      return 'Health check failed'
    }

    const details: string[] = []
    for (const [key, value] of Object.entries(errors)) {
      if (typeof value === 'object' && value !== null) {
        const info = value as Record<string, unknown>
        const rawMessage = info.message ?? info.error ?? 'check failed'
        const message = typeof rawMessage === 'string'
          ? rawMessage
          : JSON.stringify(rawMessage)
        details.push(`${key}: ${message}`)
      }
    }

    return details.length > 0 ? details.join('; ') : 'Health check failed'
  }
}
