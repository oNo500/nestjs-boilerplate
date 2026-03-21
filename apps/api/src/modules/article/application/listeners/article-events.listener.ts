import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClsService } from 'nestjs-cls'

import { ArticleArchivedEvent } from '@/modules/article/domain/events/article-archived.event'
import { ArticleCreatedEvent } from '@/modules/article/domain/events/article-created.event'
import { ArticlePublishedEvent } from '@/modules/article/domain/events/article-published.event'
import { ArticleUpdatedEvent } from '@/modules/article/domain/events/article-updated.event'
import { AUDIT_LOGGER } from '@/shared-kernel/application/ports/audit-logger.port'

import type { AuditLogger } from '@/shared-kernel/application/ports/audit-logger.port'

@Injectable()
export class ArticleEventsListener {
  private readonly logger = new Logger(ArticleEventsListener.name)

  constructor(
    @Inject(AUDIT_LOGGER) private readonly auditLogger: AuditLogger,
    private readonly cls: ClsService,
  ) {}

  @OnEvent(ArticleCreatedEvent.name)
  async handleArticleCreated(event: ArticleCreatedEvent): Promise<void> {
    this.logger.log(`Article created: ${event.articleId}`)
    await this.auditLogger.log({
      action: 'article.created',
      resourceType: 'article',
      resourceId: event.articleId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: { title: event.title },
    })
  }

  @OnEvent(ArticlePublishedEvent.name)
  async handleArticlePublished(event: ArticlePublishedEvent): Promise<void> {
    this.logger.log(`Article published: ${event.articleId}`)
    await this.auditLogger.log({
      action: 'article.published',
      resourceType: 'article',
      resourceId: event.articleId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: { title: event.title, slug: event.slug },
    })
  }

  @OnEvent(ArticleArchivedEvent.name)
  async handleArticleArchived(event: ArticleArchivedEvent): Promise<void> {
    this.logger.log(`Article archived: ${event.articleId}`)
    await this.auditLogger.log({
      action: 'article.archived',
      resourceType: 'article',
      resourceId: event.articleId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: {},
    })
  }

  @OnEvent(ArticleUpdatedEvent.name)
  async handleArticleUpdated(event: ArticleUpdatedEvent): Promise<void> {
    this.logger.log(`Article updated: ${event.articleId}`)
    await this.auditLogger.log({
      action: 'article.updated',
      resourceType: 'article',
      resourceId: event.articleId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: {},
    })
  }
}
