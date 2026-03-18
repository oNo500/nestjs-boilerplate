import { Inject, Injectable } from '@nestjs/common'

import { ANALYTICS_QUERY } from '@/modules/analytics/application/ports/analytics.query.port'
import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'

import type {
  AnalyticsSummary,
  ArticleCategoryStats,
  IAnalyticsQuery,
  MonthlyOverview,
} from '@/modules/analytics/application/ports/analytics.query.port'
import type { CachePort } from '@/modules/cache/application/ports/cache.port'

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
}
