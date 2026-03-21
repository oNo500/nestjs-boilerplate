import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

export class UserRegisteredViaOAuthEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly provider: string,
  ) {
    super()
  }
}
