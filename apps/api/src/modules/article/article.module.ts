import { Module } from '@nestjs/common'

import { ArticleEventsListener } from '@/modules/article/application/listeners/article-events.listener'
import { ARTICLE_REPOSITORY } from '@/modules/article/application/ports/article.repository.port'
import { SLUG_GENERATOR } from '@/modules/article/application/ports/slug-generator.port'
import { ArticleService } from '@/modules/article/application/services/article.service'
import { ArticleRepositoryImpl } from '@/modules/article/infrastructure/repositories/article.repository'
import { SlugGeneratorService } from '@/modules/article/infrastructure/services/slug-generator.service'
import { ArticleController } from '@/modules/article/presentation/controllers/article.controller'

/**
 * Article Module
 *
 * Rich-domain DDD module example.
 * Demonstrates:
 * - Value objects (Title, Content, Slug, Tags)
 * - Aggregate root (Article)
 * - Domain events (ArticlePublished, etc.)
 * - Business rules enforced in the domain layer (state machine, invariant protection)
 */
@Module({
  controllers: [ArticleController],
  providers: [
    // Application Service
    ArticleService,

    // Event Listeners
    ArticleEventsListener,

    // Repository implementation (DIP)
    {
      provide: ARTICLE_REPOSITORY,
      useClass: ArticleRepositoryImpl,
    },

    // Slug Generator implementation (DIP)
    {
      provide: SLUG_GENERATOR,
      useClass: SlugGeneratorService,
    },
  ],
  exports: [ArticleService],
})
export class ArticleModule {}
