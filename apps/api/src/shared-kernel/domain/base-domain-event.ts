/**
 * Base domain event
 *
 * All domain events must extend this class
 * Domain events are facts that have occurred, use past tense naming
 */
export abstract class BaseDomainEvent {
  /**
   * Event occurrence time
   */
  readonly occurredAt: Date

  /**
   * Aggregate root ID
   */
  readonly aggregateId: string

  /**
   * Event type (for event routing)
   */
  abstract readonly eventType: string

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId
    this.occurredAt = new Date()
  }

  /**
   * Get event metadata
   */
  getMetadata() {
    return {
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt,
    }
  }
}
