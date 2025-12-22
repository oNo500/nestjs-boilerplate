import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'

import { DrizzleHealthIndicator } from '@/app/health/drizzle.health'

/**
 * Health check controller for Kubernetes probes and load balancers
 */
@Controller('health')
@ApiTags('health')
@SkipThrottle() // Skip rate limiting for health endpoints
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly drizzle: DrizzleHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  /**
   * Full health check - database, memory, and disk
   */
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Full health check',
    description: 'Checks database, memory, and disk health for production monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'All components healthy',
    schema: {
      example: {
        database: { status: 'up', message: 'Database is available' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more components unhealthy',
    schema: {
      example: {
        type: 'https://api.example.com/errors/service-unavailable',
        title: 'Service Unavailable',
        status: 503,
        detail: 'database: Connection refused',
        instance: '/health',
        request_id: 'req_abc123',
        timestamp: '2024-11-03T10:30:00Z',
      },
    },
  })
  async check() {
    try {
      const result = await this.health.check([
        // Database health
        () => this.drizzle.isHealthy('database'),

        // Heap memory (max 150MB)
        () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

        // RSS memory (max 300MB)
        () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

        // Disk usage (max 90%)
        () =>
          this.disk.checkStorage('storage', {
            path: '/',
            thresholdPercent: 0.9,
          }),
      ])
      return result.details
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
   * Readiness probe - checks if app is ready to receive traffic
   */
  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Checks if app is ready to receive traffic (database only)',
  })
  @ApiResponse({ status: 200, description: 'App is ready' })
  @ApiResponse({ status: 503, description: 'App is not ready' })
  async ready() {
    try {
      const result = await this.health.check([
        // Only check critical dependencies
        () => this.drizzle.isHealthy('database'),
      ])
      return result.details
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
   * Liveness probe - checks if app is still running
   * Kubernetes restarts the pod if this fails
   */
  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Checks if app is alive (lightweight check)',
  })
  @ApiResponse({ status: 200, description: 'App is alive' })
  @ApiResponse({ status: 503, description: 'App is unhealthy' })
  async live() {
    try {
      const result = await this.health.check([
        // Only check memory to avoid external dependency restarts
        () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      ])
      return result.details
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
   * Format health check errors into detail string
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
