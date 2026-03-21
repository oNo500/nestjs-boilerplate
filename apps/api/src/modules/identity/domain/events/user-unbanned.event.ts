import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

export class UserUnbannedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly actorId: string,
    public readonly before: { banned: true },
    public readonly after: { banned: false },
  ) {
    super()
  }
}
