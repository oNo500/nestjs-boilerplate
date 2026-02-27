import { DomainEvent } from '@/shared-kernel/domain/events'

/**
 * Article archived event
 *
 * Emitted when an article is archived from the published state.
 */
export class ArticleArchivedEvent extends DomainEvent {
  constructor(public readonly articleId: string) {
    super()
  }
}
