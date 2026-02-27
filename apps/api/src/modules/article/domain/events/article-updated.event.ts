import { DomainEvent } from '@/shared-kernel/domain/events'

/**
 * Article updated event
 *
 * Emitted when an article's content is updated.
 */
export class ArticleUpdatedEvent extends DomainEvent {
  constructor(public readonly articleId: string) {
    super()
  }
}
