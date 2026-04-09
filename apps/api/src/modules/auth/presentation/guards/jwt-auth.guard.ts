import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { IS_PUBLIC_KEY } from '@/shared-kernel/infrastructure/decorators/public.decorator'

import type { ExecutionContext } from '@nestjs/common'

/**
 * JWT authentication guard
 *
 * Applied globally via APP_GUARD. Routes marked with @Public() are skipped.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}
