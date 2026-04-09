import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'
import { UserLoggedInViaOAuthEvent } from '@/modules/auth/domain/events/user-logged-in-via-oauth.event'
import { UserLoggedInEvent } from '@/modules/auth/domain/events/user-logged-in.event'
import { UserRegisteredViaOAuthEvent } from '@/modules/auth/domain/events/user-registered-via-oauth.event'

@Injectable()
export class AuthAuditListener {
  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent(UserLoggedInEvent.name)
  async onUserLoggedIn(event: UserLoggedInEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'auth.login',
      actorId: event.userId,
      actorEmail: event.email,
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserLoggedInViaOAuthEvent.name)
  async onUserLoggedInViaOAuth(event: UserLoggedInViaOAuthEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'auth.oauth.login',
      actorId: event.userId,
      actorEmail: event.email,
      detail: { provider: event.provider, linked: event.linked },
      occurredAt: event.occurredOn,
    })
  }

  @OnEvent(UserRegisteredViaOAuthEvent.name)
  async onUserRegisteredViaOAuth(event: UserRegisteredViaOAuthEvent): Promise<void> {
    await this.auditLogService.log({
      action: 'auth.oauth.register',
      actorId: event.userId,
      actorEmail: event.email,
      detail: { provider: event.provider },
      occurredAt: event.occurredOn,
    })
  }
}
