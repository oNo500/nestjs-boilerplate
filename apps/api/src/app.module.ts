import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ClsModule } from 'nestjs-cls'

import { createClsConfig } from '@/app/config/cls.config'
import { validateEnv } from '@/app/config/env.schema'
import { AllExceptionsFilter } from '@/app/filters/all-exceptions.filter'
import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'
import { ThrottlerExceptionFilter } from '@/app/filters/throttler-exception.filter'
import { HealthModule } from '@/app/health/health.module'
import { CorrelationIdInterceptor } from '@/app/interceptors/correlation-id.interceptor'
import { RequestContextInterceptor } from '@/app/interceptors/request-context.interceptor'
import { TraceContextInterceptor } from '@/app/interceptors/trace-context.interceptor'
import { LoggerModule } from '@/app/logger/logger.module'
import { ETagMiddleware } from '@/app/middleware/etag.middleware'
import { AnalyticsModule } from '@/modules/analytics/analytics.module'
import { ArticleModule } from '@/modules/article/article.module'
import { AuditLogInterceptor } from '@/modules/audit-log/audit-log.interceptor'
import { AuditLogModule } from '@/modules/audit-log/audit-log.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CacheModule } from '@/modules/cache/cache.module'
import { OrderModule } from '@/modules/order/order.module'
import { ProfileModule } from '@/modules/profile/profile.module'
import { ScheduledTasksModule } from '@/modules/scheduled-tasks/scheduled-tasks.module'
import { TodoModule } from '@/modules/todo/todo.module'
import { UploadModule } from '@/modules/upload/upload.module'
import { UserManagementModule } from '@/modules/user-management/user-management.module'
import { DrizzleModule } from '@/shared-kernel/infrastructure/db/db.module'
import { DomainEventsModule } from '@/shared-kernel/infrastructure/events/domain-events.module'

import type { Env } from '@/app/config/env.schema'
import type { NestModule, MiddlewareConsumer } from '@nestjs/common'

/**
 * Root module: assembles all feature modules and infrastructure
 *
 * Architecture notes:
 * - Based on Modular Layered Architecture
 * - Incorporates the Dependency Inversion Principle (DIP)
 * - Uses DDD (Domain-Driven Design) on demand
 */
@Module({
  imports: [
    // Config module: global environment variable management
    ConfigModule.forRoot({
      isGlobal: true, // make ConfigService available throughout the application
      validate: validateEnv, // validate environment variables with Zod
      cache: true, // cache environment variables for improved performance
    }),
    // CLS module: request context management (Request ID, tracing, etc.)
    ClsModule.forRoot(createClsConfig()),
    // Schedule module: cron jobs and task scheduling
    ScheduleModule.forRoot(),
    // Logger module: high-performance structured logging (Pino)
    LoggerModule,
    // Event module: domain events and integration events
    EventEmitterModule.forRoot({
      wildcard: true, // support wildcard event listeners (e.g. 'user.*')
      delimiter: '.', // event name delimiter
      maxListeners: 10, // maximum listeners per event
      verboseMemoryLeak: true, // warn when maxListeners is exceeded
      ignoreErrors: false, // do not suppress errors from event handlers
    }),
    // Database module: global Drizzle instance
    DrizzleModule.forRoot(),
    // Domain events module: global domain event publisher
    DomainEventsModule,
    // Rate limiting module: prevent API abuse (read from env vars; unlimited by default locally)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Env, true>) => [
        {
          ttl: configService.get('THROTTLE_TTL', { infer: true }),
          limit: configService.get('THROTTLE_LIMIT', { infer: true }),
        },
      ],
      inject: [ConfigService],
    }),
    HealthModule, // health check module
    AuditLogModule, // audit log module (global)
    // Business modules
    TodoModule, // Todo module (anemic model example)
    ProfileModule, // Profile module (user profile management)
    CacheModule, // Cache module (thin application layer example)
    ArticleModule, // Article module (rich model DDD example)
    AuthModule, // Auth module (authentication + DDD example)
    UserManagementModule, // User Management module (user management CRUD)
    OrderModule, // Order module (rich model DDD + 4 advanced HTTP features)
    ScheduledTasksModule, // Scheduled tasks (cron, interval, timeout examples)
    UploadModule, // File upload (Multer + local storage)
    AnalyticsModule, // Analytics dashboard data endpoints
  ],
  providers: [
    // Global rate-limiting guard
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
    // Audit log interceptor (global, depends on AuditLogModule)
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Register global middleware
    consumer
      .apply(ETagMiddleware) // ETag and 304 Not Modified support
      .forRoutes('{*path}') // apply to all routes
  }
}
