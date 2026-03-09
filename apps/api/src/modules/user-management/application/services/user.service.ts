import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import {
  USER_MANAGEMENT_REPOSITORY,
} from '@/modules/user-management/application/ports/user.repository.port'
import { hasRequiredRole } from '@/shared-kernel/domain/value-objects/role.vo'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { CreateUserData, UpdateUserData, UserInfo, UserListQuery, UserListResult, UserManagementRepository, UserSummary } from '@/modules/user-management/application/ports/user.repository.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * Adapted to better-auth schema: hard delete only, no soft delete
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MANAGEMENT_REPOSITORY)
    private readonly userRepository: UserManagementRepository,
  ) {}

  async findAll(query: UserListQuery): Promise<UserListResult> {
    return this.userRepository.findAll(query)
  }

  async findById(id: string): Promise<UserInfo> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }
    return user
  }

  async create(data: CreateUserData): Promise<UserInfo> {
    const exists = await this.userRepository.existsByEmail(data.email)
    if (exists) {
      throw new ConflictException({ code: ErrorCode.EMAIL_EXISTS, message: 'This email address is already in use' })
    }

    return this.userRepository.create(data)
  }

  async update(id: string, data: UpdateUserData): Promise<UserInfo> {
    const updated = await this.userRepository.update(id, data)
    if (!updated) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.hardDelete(id)
    if (!deleted) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }
  }

  async getSummary(): Promise<UserSummary> {
    return this.userRepository.getSummary()
  }

  async assignRole(
    targetUserId: string,
    newRole: RoleType,
    actorId: string,
    actorRole: RoleType,
  ): Promise<UserInfo> {
    if (actorId === targetUserId) {
      throw new ForbiddenException({ code: ErrorCode.FORBIDDEN, message: 'Modifying your own role is not allowed' })
    }

    if (!hasRequiredRole(actorRole, 'ADMIN')) {
      throw new ForbiddenException({ code: ErrorCode.INSUFFICIENT_SCOPE, message: 'Insufficient permissions' })
    }

    const updated = await this.userRepository.update(targetUserId, { role: newRole })
    if (!updated) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${targetUserId} not found` })
    }

    return updated
  }
}
