import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { DomainEventPublisher } from '@/app/events/domain-event-publisher'
import {
  IDENTITY_REPOSITORY,
} from '@/modules/identity/application/ports/user.repository.port'
import { UserBannedEvent } from '@/modules/identity/domain/events/user-banned.event'
import { UserCreatedEvent } from '@/modules/identity/domain/events/user-created.event'
import { UserDeletedEvent } from '@/modules/identity/domain/events/user-deleted.event'
import { UserRoleAssignedEvent } from '@/modules/identity/domain/events/user-role-assigned.event'
import { UserUnbannedEvent } from '@/modules/identity/domain/events/user-unbanned.event'
import { hasRequiredRole } from '@/shared-kernel/domain/value-objects/role.vo'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { CreateUserData, UpdateUserData, UserInfo, UserListQuery, UserListResult, IdentityRepository, UserSummary } from '@/modules/identity/application/ports/user.repository.port'
import type { IdentityPort, UserIdentity } from '@/shared-kernel/application/ports/identity.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * Adapted to better-auth schema: hard delete only, no soft delete
 */
@Injectable()
export class UserService implements IdentityPort {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly userRepository: IdentityRepository,
    private readonly eventPublisher: DomainEventPublisher,
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

    const user = await this.userRepository.create(data)
    await this.eventPublisher.publish(new UserCreatedEvent(user.id, user.email, user.name, user.role as RoleType | null))
    return user
  }

  async update(id: string, data: UpdateUserData, actorId: string): Promise<UserInfo> {
    const existing = await this.userRepository.findById(id)
    if (!existing) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }

    const updated = await this.userRepository.update(id, data)
    if (!updated) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }

    // Emit ban/unban events when banned status changes
    if (data.banned !== undefined && data.banned !== existing.banned) {
      await (data.banned
        ? this.eventPublisher.publish(
            new UserBannedEvent(
              id,
              actorId,
              data.banReason ?? null,
              { banned: false },
              { banned: true, banReason: data.banReason ?? null },
            ),
          )
        : this.eventPublisher.publish(
            new UserUnbannedEvent(id, actorId, { banned: true }, { banned: false }),
          ))
    }

    return updated
  }

  async delete(id: string, actorId: string): Promise<void> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }

    const deleted = await this.userRepository.hardDelete(id)
    if (!deleted) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${id} not found` })
    }

    await this.eventPublisher.publish(
      new UserDeletedEvent(id, actorId, { email: user.email, name: user.name, role: user.role as RoleType | null }),
    )
  }

  async getSummary(): Promise<UserSummary> {
    return this.userRepository.getSummary()
  }

  // IdentityPort implementation
  async findIdentityById(id: string): Promise<UserIdentity | null> {
    const user = await this.userRepository.findById(id)
    if (!user) return null
    return { id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned }
  }

  async existsAndActive(id: string): Promise<boolean> {
    return this.userRepository.existsAndActive(id)
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

    const existing = await this.userRepository.findById(targetUserId)
    if (!existing) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${targetUserId} not found` })
    }

    const updated = await this.userRepository.update(targetUserId, { role: newRole })
    if (!updated) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND, message: `User ${targetUserId} not found` })
    }

    await this.eventPublisher.publish(
      new UserRoleAssignedEvent(targetUserId, actorId, { role: existing.role as RoleType | null }, { role: newRole }),
    )

    return updated
  }
}
