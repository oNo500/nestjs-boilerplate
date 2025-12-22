import { DomainEvent } from './domain-event.base'

/**
 * Integration event base class
 *
 * For cross-bounded-context (inter-module) communication.
 * Integration events should contain sufficient information to avoid recipient lookups.
 *
 * @example
 * ```typescript
 * export class UserRegisteredIntegrationEvent extends IntegrationEvent {
 *   constructor(
 *     public readonly userId: string,
 *     public readonly email: string,
 *     public readonly username: string,
 *   ) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class IntegrationEvent extends DomainEvent {
  /**
   * Event version (for event evolution)
   */
  public readonly version: number = 1

  /**
   * Bounded context/module name that published the event
   */
  public readonly source: string

  constructor(source: string) {
    super()
    this.source = source
  }
}
