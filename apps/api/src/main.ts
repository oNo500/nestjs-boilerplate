import { RequestMethod } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { Logger } from 'nestjs-pino'

import { corsConfig } from '@/app/config/security.config'
import { setupSwagger } from '@/app/config/swagger.config'
import { createValidationPipe } from '@/app/config/validation.config'
import { AllExceptionsFilter } from '@/app/filters/all-exceptions.filter'
import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'
import { ThrottlerExceptionFilter } from '@/app/filters/throttler-exception.filter'
import { CorrelationIdInterceptor } from '@/app/interceptors/correlation-id.interceptor'
import { DeprecationInterceptor } from '@/app/interceptors/deprecation.interceptor'
import { LinkHeaderInterceptor } from '@/app/interceptors/link-header.interceptor'
import { LocationHeaderInterceptor } from '@/app/interceptors/location-header.interceptor'
import { RequestContextInterceptor } from '@/app/interceptors/request-context.interceptor'
import { TimeoutInterceptor } from '@/app/interceptors/timeout.interceptor'
import { TraceContextInterceptor } from '@/app/interceptors/trace-context.interceptor'
import { TransformInterceptor } from '@/app/interceptors/transform.interceptor'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until Logger is ready
  })

  // Use nestjs-pino Logger
  app.useLogger(app.get(Logger))

  // CORS config
  app.enableCors(corsConfig)

  // Global route prefix
  app.setGlobalPrefix('api', {
    exclude: [
      // Exclude Swagger dev credentials endpoint
      { path: '.well-known', method: RequestMethod.ALL },
      { path: '.well-known/{*path}', method: RequestMethod.ALL },
      // Exclude health check endpoints
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/{*path}', method: RequestMethod.ALL },
    ],
  })

  // Global exception filters (specific to general)
  app.useGlobalFilters(
    app.get(ThrottlerExceptionFilter),
    app.get(ProblemDetailsFilter),
    app.get(AllExceptionsFilter),
  )

  // Global interceptors (in execution order)
  app.useGlobalInterceptors(
    // 1. Request context (add trace headers to response)
    app.get(RequestContextInterceptor),
    app.get(CorrelationIdInterceptor),
    app.get(TraceContextInterceptor),

    // 2. Timeout control (30s)
    new TimeoutInterceptor(30_000),

    // 3. Location header (201 Created)
    new LocationHeaderInterceptor(),

    // 4. Link header (pagination links)
    new LinkHeaderInterceptor(),

    // 5. Deprecation warning
    app.get(DeprecationInterceptor),

    // 6. Response formatting (executed last)
    new TransformInterceptor(app.get(Reflector)),
  )

  // Global validation pipe
  app.useGlobalPipes(createValidationPipe())

  // Swagger docs
  await setupSwagger(app)

  const port = process.env.PORT ?? 3000
  await app.listen(port)

  const logger = app.get(Logger)
  const env = process.env.NODE_ENV ?? 'development'
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
