import { Injectable } from '@nestjs/common'

import type { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'
import type { DomainEvent } from '@/shared-kernel/domain/events/domain-event.base'
import type { EventEmitter2 } from '@nestjs/event-emitter'

/**
 * Domain event publisher
 *
 * Responsible for collecting events from aggregate roots and publishing them to the event bus.
 */
@Injectable()
export class DomainEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publishEventsForAggregate(aggregate: BaseAggregateRoot): Promise<void> {
    const events = aggregate.getDomainEvents()
    for (const event of events) {
      await this.publish(event)
    }
    aggregate.clearDomainEvents()
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.eventEmitter.emitAsync(event.eventName, event)
  }
}
