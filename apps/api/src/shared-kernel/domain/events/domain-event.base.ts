/**
 * Domain event base class
 *
 * All domain events must extend this class. Domain events communicate important business state changes within bounded contexts.
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
   * Event timestamp
   */
  public readonly occurredOn: Date

  /**
   * Event unique identifier (optional, for idempotency handling)
   */
  public readonly eventId: string

  constructor() {
    this.occurredOn = new Date()
    this.eventId = crypto.randomUUID()
  }

  /**
   * Get event name (for event bus routing)
   * Defaults to class name, can be overridden by subclasses
   */
  get eventName(): string {
    return this.constructor.name
  }
}
