import type { DomainEvent } from './events/domain-event.base'

export abstract class BaseAggregateRoot {
  #domainEvents: DomainEvent[] = []

  getDomainEvents(): DomainEvent[] {
    return [...this.#domainEvents]
  }

  protected addDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event)
  }

  clearDomainEvents(): void {
    this.#domainEvents = []
  }
}
