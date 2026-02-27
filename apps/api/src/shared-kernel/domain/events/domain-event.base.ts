/**
 * Base class for domain events
 *
 * All domain events must extend this class. Domain events are used to
 * propagate significant business state changes within a bounded context.
 *
 * @example
 * ```typescript
 * export class ArticlePublishedEvent extends DomainEvent {
 *   constructor(
 *     public readonly articleId: string,
 *     public readonly title: string,
 *   ) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class DomainEvent {
  /**
   * Timestamp when the event occurred
   */
  public readonly occurredOn: Date

  /**
   * Unique event identifier (optional; used for idempotency handling)
   */
  public readonly eventId: string

  constructor() {
    this.occurredOn = new Date()
    this.eventId = crypto.randomUUID()
  }

  /**
   * Get the event name (used for event bus routing).
   * Defaults to the class name; subclasses may override.
   */
  get eventName(): string {
    return this.constructor.name
  }
}
