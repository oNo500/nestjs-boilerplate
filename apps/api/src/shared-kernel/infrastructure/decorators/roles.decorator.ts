import { SetMetadata } from '@nestjs/common'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export const ROLES_KEY = 'roles'

/**
 * Role-based authorization decorator
 *
 * Used with RolesGuard to specify the minimum role required to access the route.
 *
 * @example
 * @Roles('ADMIN')
 * @Get('admin-only')
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles)
