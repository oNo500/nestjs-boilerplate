import { DomainEvent } from '@/shared-kernel/domain/events'

export class OrderPaidEvent extends DomainEvent {
  constructor(public readonly orderId: string) {
    super()
  }
}
