import { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'

export class UserLoggedInViaOAuthEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly provider: string,
    public readonly linked: boolean,
  ) {
    super()
  }
}
