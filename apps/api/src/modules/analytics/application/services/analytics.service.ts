import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { ANALYTICS_QUERY } from '@/modules/analytics/application/ports/analytics.query.port'
import { CACHE_PORT } from '@/shared-kernel/application/ports/cache.port'

import type {
  AnalyticsSummary,
  ArticleCategoryStats,
  IAnalyticsQuery,
  MonthlyOverview,
} from '@/modules/analytics/application/ports/analytics.query.port'
import type { CachePort } from '@/shared-kernel/application/ports/cache.port'

const CACHE_KEYS = {
  SUMMARY: 'analytics:summary',
  MONTHLY_OVERVIEW: 'analytics:monthly-overview',
  ARTICLE_CATEGORY_STATS: 'analytics:article-category-stats',
} as const

const CACHE_TTL = {
  SUMMARY: 300,
  MONTHLY_OVERVIEW: 1800,
  ARTICLE_CATEGORY_STATS: 600,
} as const

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(
    @Inject(ANALYTICS_QUERY)
    private readonly analyticsQuery: IAnalyticsQuery,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  getSummary(): Promise<AnalyticsSummary> {
    return this.cache.wrap(
      CACHE_KEYS.SUMMARY,
      () => this.analyticsQuery.getSummary(),
      CACHE_TTL.SUMMARY,
    )
  }

  getMonthlyOverview(): Promise<MonthlyOverview> {
    return this.cache.wrap(
      CACHE_KEYS.MONTHLY_OVERVIEW,
      () => this.analyticsQuery.getMonthlyOverview(),
      CACHE_TTL.MONTHLY_OVERVIEW,
    )
  }

  getArticleCategoryStats(): Promise<ArticleCategoryStats> {
    return this.cache.wrap(
      CACHE_KEYS.ARTICLE_CATEGORY_STATS,
      () => this.analyticsQuery.getArticleCategoryStats(),
      CACHE_TTL.ARTICLE_CATEGORY_STATS,
    )
  }

  @Cron('0 2 * * *')
  async invalidateCache(): Promise<void> {
    await Promise.all(Object.values(CACHE_KEYS).map((key) => this.cache.del(key)))
    this.logger.log('Analytics cache invalidated')
  }
}
