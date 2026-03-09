import { RequestMethod } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { Logger } from 'nestjs-pino'

import { createCorsConfig } from '@/app/config/security.config'
import { setupSwagger } from '@/app/config/swagger.config'
import { createValidationPipe } from '@/app/config/validation.config'
import { AllExceptionsFilter } from '@/app/filters/all-exceptions.filter'
import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'
import { ThrottlerExceptionFilter } from '@/app/filters/throttler-exception.filter'
import { CorrelationIdInterceptor } from '@/app/interceptors/correlation-id.interceptor'
import { LinkHeaderInterceptor } from '@/app/interceptors/link-header.interceptor'
import { LocationHeaderInterceptor } from '@/app/interceptors/location-header.interceptor'
import { RequestContextInterceptor } from '@/app/interceptors/request-context.interceptor'
import { TimeoutInterceptor } from '@/app/interceptors/timeout.interceptor'
import { TraceContextInterceptor } from '@/app/interceptors/trace-context.interceptor'
import { TransformInterceptor } from '@/app/interceptors/transform.interceptor'

import { AppModule } from './app.module'

import type { Env } from '@/app/config/env.schema'
import type { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // buffer logs until Logger is ready
  })

  // Use nestjs-pino Logger
  app.useLogger(app.get(Logger))

  // Static file serving for uploaded files
  app.useStaticAssets('./uploads', { prefix: '/uploads' })

  // CORS configuration
  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const allowedOrigins = configService.get('ALLOWED_ORIGINS', { infer: true })
  app.enableCors(createCorsConfig(allowedOrigins))

  // Global route prefix
  app.setGlobalPrefix('api', {
    exclude: [
      // Exclude Swagger well-known endpoints
      { path: '.well-known', method: RequestMethod.ALL },
      { path: '.well-known/{*path}', method: RequestMethod.ALL },
      // Exclude health check endpoints
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/{*path}', method: RequestMethod.ALL },
    ],
  })

  // Global exception filters (most specific to most generic)
  app.useGlobalFilters(
    app.get(ThrottlerExceptionFilter),
    app.get(ProblemDetailsFilter),
    app.get(AllExceptionsFilter),
  )

  // Global interceptors (in execution order)
  app.useGlobalInterceptors(
    // 1. Request context (add tracing headers to response)
    app.get(RequestContextInterceptor),
    app.get(CorrelationIdInterceptor),
    app.get(TraceContextInterceptor),

    // 2. Timeout control (30 seconds)
    new TimeoutInterceptor(30_000),

    // 3. Location header (201 Created)
    new LocationHeaderInterceptor(),

    // 4. Link header (pagination links)
    new LinkHeaderInterceptor(),

    // 5. Response formatting (executed last)
    new TransformInterceptor(app.get(Reflector)),
  )

  // Global validation pipe
  app.useGlobalPipes(createValidationPipe())

  // Swagger documentation
  setupSwagger(app)

  const port = configService.get('PORT', { infer: true })
  await app.listen(port)

  const logger = app.get(Logger)
  const env = configService.get('NODE_ENV', { infer: true })
  const nodeVersion = process.version
  const baseUrl = `http://localhost:${port}`

  const startupMessage = `
┌─────────────────────────────────────────────────────┐
│              NestJS Boilerplate Server              │
├─────────────────────────────────────────────────────┤
│  Environment:  ${env.padEnd(35)}  │
│  Port:         ${String(port).padEnd(35)}  │
│  Node:         ${nodeVersion.padEnd(35)}  │
├─────────────────────────────────────────────────────┤
│  Endpoints:                                         │
│  - App:        ${baseUrl.padEnd(35)}  │
│  - Docs:       ${`${baseUrl}/docs`.padEnd(35)}  │
│  - Swagger:    ${`${baseUrl}/swagger`.padEnd(35)}  │
│  - YAML:       ${`${baseUrl}/openapi.yaml`.padEnd(35)}  │
│  - Health:     ${`${baseUrl}/health`.padEnd(35)}  │
└─────────────────────────────────────────────────────┘`

  logger.log(startupMessage)
}

await bootstrap()
