import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

export class UserLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    super()
  }
}
