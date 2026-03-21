import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

export class UserBannedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly actorId: string,
    public readonly reason: string | null,
    public readonly before: { banned: false },
    public readonly after: { banned: true, banReason: string | null },
  ) {
    super()
  }
}
