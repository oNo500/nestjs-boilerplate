import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: RoleType | null,
  ) {
    super()
  }
}
