import { DomainEvent } from '@/shared-kernel/domain/events'

export class OrderCancelledEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super()
  }
}
