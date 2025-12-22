import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ClsModule } from 'nestjs-cls'

import { createClsConfig } from '@/app/config/cls.config'
import { validateEnv } from '@/app/config/env.schema'
import { throttlerConfig } from '@/app/config/security.config'
import { AllExceptionsFilter } from '@/app/filters/all-exceptions.filter'
import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'
import { ThrottlerExceptionFilter } from '@/app/filters/throttler-exception.filter'
import { HealthModule } from '@/app/health/health.module'
import { CorrelationIdInterceptor } from '@/app/interceptors/correlation-id.interceptor'
import { DeprecationInterceptor } from '@/app/interceptors/deprecation.interceptor'
import { RequestContextInterceptor } from '@/app/interceptors/request-context.interceptor'
import { TraceContextInterceptor } from '@/app/interceptors/trace-context.interceptor'
import { LoggerModule } from '@/app/logger/logger.module'
import { ApiVersionMiddleware } from '@/app/middleware/api-version.middleware'
import { ETagMiddleware } from '@/app/middleware/etag.middleware'
import { SwaggerDevController } from '@/app/swagger/swagger-dev.controller'
import { AuthModule } from '@/modules/auth/auth.module'
import { TodoModule } from '@/modules/todo/todo.module'
import { DrizzleModule } from '@/shared-kernel/infrastructure/db/db.module'
import { DomainEventsModule } from '@/shared-kernel/infrastructure/events/domain-events.module'

import type { NestModule, MiddlewareConsumer } from '@nestjs/common'

/**
 * Root module: assembles all feature modules and infrastructure
 *
 * Architecture:
 * - Modular Layered Architecture
 * - Dependency Inversion Principle (DIP)
 * - DDD (Domain-Driven Design) where appropriate
 */
@Module({
  imports: [
    // Config module: global environment variable management
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available app-wide
      validate: validateEnv, // Validate env vars with Zod
      cache: true, // Cache env vars for performance
    }),
    // CLS module: request context management (Request ID, tracing, etc.)
    ClsModule.forRoot(createClsConfig()),
    // Logger module: high-performance structured logging (Pino)
    LoggerModule,
    // Event module: domain and integration events
    EventEmitterModule.forRoot({
      wildcard: true, // Support wildcard event listeners (e.g., 'user.*')
      delimiter: '.', // Event name delimiter
      maxListeners: 10, // Max listeners per event
      verboseMemoryLeak: true, // Warn when exceeding maxListeners
      ignoreErrors: false, // Don't ignore event handler errors
    }),
    // Database module: global Drizzle instance
    DrizzleModule.forRoot(),
    // Domain events module: global domain event publisher
    DomainEventsModule,
    // Rate limiting module: prevent API abuse
    ThrottlerModule.forRoot([
      {
        ttl: throttlerConfig.ttl,
        limit: throttlerConfig.limit,
      },
    ]),
    HealthModule, // Health check module
    // Business modules
    TodoModule, // Todo module (anemic model example)
    AuthModule, // Auth module (authentication + DDD example)
  ],
  controllers: [
    // Dev helper controller (dev only)
    ...(process.env.NODE_ENV === 'production' ? [] : [SwaggerDevController]),
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Exception filters (require ClsService injection)
    AllExceptionsFilter,
    ProblemDetailsFilter,
    ThrottlerExceptionFilter,
    // Interceptors (require ClsService injection)
    RequestContextInterceptor,
    CorrelationIdInterceptor,
    TraceContextInterceptor,
    DeprecationInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Register global middleware
    consumer
      .apply(
        ApiVersionMiddleware, // API versioning (must be before ETag)
        ETagMiddleware, // ETag and 304 Not Modified support
      )
      .forRoutes('{*path}') // Apply to all routes
  }
}
