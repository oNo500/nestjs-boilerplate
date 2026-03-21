import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export interface JwtPayload {
  sub: string // User ID
  email: string
  roles: RoleType[]
  sessionId: string // Session ID
}
