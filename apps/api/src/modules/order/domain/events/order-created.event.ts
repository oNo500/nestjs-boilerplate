import { DomainEvent } from '@/shared-kernel/domain/events'

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
  ) {
    super()
  }
}
