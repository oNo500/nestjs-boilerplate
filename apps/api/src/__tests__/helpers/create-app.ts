import { RequestMethod } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'

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
import { AppModule } from '@/app.module'

import type { INestApplication, Type } from '@nestjs/common'

export interface CreateTestAppOptions {
  moduleOverrides?: { original: Type, replacement: Type }[]
}

export async function createTestApp(options: CreateTestAppOptions = {}): Promise<INestApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule] })

  for (const { original, replacement } of options.moduleOverrides ?? []) {
    builder = builder.overrideModule(original).useModule(replacement)
  }

  const moduleFixture = await builder.compile()
  const app = moduleFixture.createNestApplication()

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '.well-known', method: RequestMethod.ALL },
      { path: '.well-known/{*path}', method: RequestMethod.ALL },
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/{*path}', method: RequestMethod.ALL },
    ],
  })

  app.useGlobalFilters(
    app.get(ThrottlerExceptionFilter),
    app.get(ProblemDetailsFilter),
    app.get(AllExceptionsFilter),
  )

  app.useGlobalInterceptors(
    app.get(RequestContextInterceptor),
    app.get(CorrelationIdInterceptor),
    app.get(TraceContextInterceptor),
    new TimeoutInterceptor(30_000),
    new LocationHeaderInterceptor(),
    new LinkHeaderInterceptor(),
    new TransformInterceptor(app.get(Reflector)),
  )

  app.useGlobalPipes(createValidationPipe())

  await app.init()
  return app
}
