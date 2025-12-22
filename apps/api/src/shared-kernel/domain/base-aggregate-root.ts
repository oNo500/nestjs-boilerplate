import type { BaseDomainEvent } from './base-domain-event'

/**
 * Base aggregate root
 *
 * Provides domain event collection and publishing functionality
 */
export abstract class BaseAggregateRoot {
  #domainEvents: BaseDomainEvent[] = []

  /**
   * Get all pending domain events
   */
  getDomainEvents(): BaseDomainEvent[] {
    return [...this.#domainEvents]
  }

  /**
   * Add domain event to pending queue
   */
  protected addDomainEvent(event: BaseDomainEvent): void {
    this.#domainEvents.push(event)
  }

  /**
   * Clear domain event queue
   * Typically called after events are published
   */
  clearDomainEvents(): void {
    this.#domainEvents = []
  }
}
