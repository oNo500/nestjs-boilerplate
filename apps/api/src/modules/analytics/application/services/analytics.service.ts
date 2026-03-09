import { Inject, Injectable } from '@nestjs/common'

import { ANALYTICS_REPOSITORY } from '@/modules/analytics/application/ports/analytics.repository.port'

import type {
  AnalyticsSummary,
  ArticleCategoryStats,
  IAnalyticsRepository,
  MonthlyOverview,
} from '@/modules/analytics/application/ports/analytics.repository.port'

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  getSummary(): Promise<AnalyticsSummary> {
    return this.analyticsRepository.getSummary()
  }

  getMonthlyOverview(): Promise<MonthlyOverview> {
    return this.analyticsRepository.getMonthlyOverview()
  }

  getArticleCategoryStats(): Promise<ArticleCategoryStats> {
    return this.analyticsRepository.getArticleCategoryStats()
  }
}
