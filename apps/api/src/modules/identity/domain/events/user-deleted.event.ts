import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export class UserDeletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly actorId: string,
    public readonly snapshot: {
      email: string
      name: string
      role: RoleType | null
    },
  ) {
    super()
  }
}
