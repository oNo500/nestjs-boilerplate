import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

export class UserRoleAssignedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly actorId: string,
    public readonly before: { role: RoleType | null },
    public readonly after: { role: RoleType },
  ) {
    super()
  }
}
