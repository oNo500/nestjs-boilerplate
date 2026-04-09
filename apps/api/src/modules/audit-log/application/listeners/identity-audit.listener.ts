import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'
import { UserBannedEvent } from '@/modules/identity/domain/events/user-banned.event'
import { UserCreatedEvent } from '@/modules/identity/domain/events/user-created.event'
import { UserDeletedEvent } from '@/modules/identity/domain/events/user-deleted.event'
import { UserRoleAssignedEvent } from '@/modules/identity/domain/events/user-role-assigned.event'
import { UserUnbannedEvent } from '@/modules/identity/domain/events/user-unbanned.event'

@Injectable()
export class IdentityAuditListener {
  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(UserCreatedEvent.name)
  async onUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'user.created',
      resourceType: 'user',
      resourceId: event.userId,
      after: { email: event.email, name: event.name, role: event.role },
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserBannedEvent.name)
  async onUserBanned(event: UserBannedEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'user.banned',
      actorId: event.actorId,
      resourceType: 'user',
      resourceId: event.userId,
      before: event.before,
      after: event.after,
      detail: event.reason ? { reason: event.reason } : undefined,
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserUnbannedEvent.name)
  async onUserUnbanned(event: UserUnbannedEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'user.unbanned',
      actorId: event.actorId,
      resourceType: 'user',
      resourceId: event.userId,
      before: event.before,
      after: event.after,
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserRoleAssignedEvent.name)
  async onUserRoleAssigned(event: UserRoleAssignedEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'user.role_assigned',
      actorId: event.actorId,
      resourceType: 'user',
      resourceId: event.userId,
      before: event.before,
      after: event.after,
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserDeletedEvent.name)
  async onUserDeleted(event: UserDeletedEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'user.deleted',
      actorId: event.actorId,
      resourceType: 'user',
      resourceId: event.userId,
      before: event.snapshot,
      occurredAt: event.occurredOn,
    })
  }
}
