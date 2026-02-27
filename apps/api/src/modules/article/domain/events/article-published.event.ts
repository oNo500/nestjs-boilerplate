import { DomainEvent } from '@/shared-kernel/domain/events'

/**
 * Article published event
 *
 * Emitted when an article is published from the draft state.
 */
export class ArticlePublishedEvent extends DomainEvent {
  constructor(
    public readonly articleId: string,
    public readonly title: string,
    public readonly slug: string,
  ) {
    super()
  }
}
