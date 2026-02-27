import { DomainEvent } from './domain-event.base'

/**
 * Integration event base class
 *
 * Used for cross-bounded-context (inter-module) communication.
 * Integration events should carry enough information so that consumers do not need to query back.
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
   * Event version (used for event schema evolution)
   */
  public readonly version: number = 1

  /**
   * Name of the bounded context / module that published this event
   */
  public readonly source: string

  constructor(source: string) {
    super()
    this.source = source
  }
}
