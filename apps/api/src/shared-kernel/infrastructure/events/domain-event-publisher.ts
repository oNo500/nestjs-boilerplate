import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import type { BaseAggregateRoot } from '@/shared-kernel/domain/base-aggregate-root'
import type { BaseDomainEvent } from '@/shared-kernel/domain/base-domain-event'

/**
 * Domain event publisher
 *
 * Collects events from aggregates and publishes to event bus
 */
@Injectable()
export class DomainEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish all domain events from aggregate
   */
  async publishEventsForAggregate(aggregate: BaseAggregateRoot): Promise<void> {
    const events = aggregate.getDomainEvents()

    for (const event of events) {
      await this.publish(event)
    }

    aggregate.clearDomainEvents()
  }

  /**
   * Publish single domain event
   */
  async publish(event: BaseDomainEvent): Promise<void> {
    const metadata = event.getMetadata()

    console.log(`[DomainEvent] Publishing: ${metadata.eventType}`, {
      aggregateId: metadata.aggregateId,
      occurredAt: metadata.occurredAt,
    })

    // Use event type as event name
    await this.eventEmitter.emitAsync(event.eventType, event)
  }
}
