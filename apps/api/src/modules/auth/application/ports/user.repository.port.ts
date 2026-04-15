import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/**
 * Adapts to the better-auth schema: uses a boolean banned field instead of status; no soft delete.
 */
export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: RoleType
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  id: string
  name: string
  email: string
  role?: RoleType
}

/**
 * Auth-scoped user repository: read + create only.
 * Management operations (ban, delete) belong to UserManagementRepository.
 */
export interface UserRepository {
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  exists(id: string): Promise<boolean>
  existsAndActive(id: string): Promise<boolean>
}
