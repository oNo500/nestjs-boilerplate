import { Controller, Get, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiExcludeController } from '@nestjs/swagger'

import type { Env } from '@/app/config/env.schema'

/**
 * Swagger dev helper controller - provides test credentials (dev only)
 */
@Controller('.well-known')
@ApiExcludeController()
export class SwaggerDevController {
  constructor(private readonly config: ConfigService<Env, true>) {}

  /**
   * Get Swagger test credentials (dev only)
   */
  @Get('swagger-credentials')
  getCredentials() {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException()
    }

    const email = this.config.get('SWAGGER_TEST_EMAIL', { infer: true })
    const password = this.config.get('SWAGGER_TEST_PASSWORD', { infer: true })

    if (!email || !password) {
      return {}
    }

    return { email, password }
  }
}
