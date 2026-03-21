import { ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { hasRequiredRole } from '@/shared-kernel/domain/value-objects/role.vo'
import { ROLES_KEY } from '@/shared-kernel/infrastructure/decorators/roles.decorator'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'
import type { CanActivate, ExecutionContext } from '@nestjs/common'

/**
 * Role-based authorization guard
 *
 * Works with the @Roles() decorator; passes through when no decorator is applied.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<{ user: { roles: RoleType[] } }>()
    const actorRole = request.user?.roles?.[0]

    if (!actorRole) {
      throw new ForbiddenException({ code: ErrorCode.FORBIDDEN, message: 'Insufficient permissions' })
    }

    const hasAccess = requiredRoles.some((required) => hasRequiredRole(actorRole, required))

    if (!hasAccess) {
      throw new ForbiddenException({ code: ErrorCode.INSUFFICIENT_SCOPE, message: 'Insufficient permissions' })
    }

    return true
  }
}
