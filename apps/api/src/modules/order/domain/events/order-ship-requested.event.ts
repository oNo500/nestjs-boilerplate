import { DomainEvent } from '@/shared-kernel/domain/events'

export class OrderShipRequestedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly jobId: string,
  ) {
    super()
  }
}
