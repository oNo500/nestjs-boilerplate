import { DomainEvent } from '@/shared-kernel/domain/events'

/**
 * Article created event
 *
 * Emitted when a new article is created.
 */
export class ArticleCreatedEvent extends DomainEvent {
  constructor(
    public readonly articleId: string,
    public readonly title: string,
  ) {
    super()
  }
}
