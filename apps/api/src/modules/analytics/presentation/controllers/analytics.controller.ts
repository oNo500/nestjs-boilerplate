import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AnalyticsService } from '@/modules/analytics/application/services/analytics.service'
import { AnalyticsSummaryDto } from '@/modules/analytics/presentation/dtos/analytics-summary.dto'
import { ArticleCategoryStatsDto } from '@/modules/analytics/presentation/dtos/article-category-stats.dto'
import { MonthlyOverviewDto } from '@/modules/analytics/presentation/dtos/monthly-overview.dto'
import { Roles } from '@/shared-kernel/infrastructure/decorators/roles.decorator'

@ApiTags('Dashboard')
@Controller('dashboard')
@Roles('ADMIN')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics-summary')
  @ApiOperation({ summary: 'Get analytics summary (published today + completed orders)' })
  @ApiResponse({ status: 200, type: AnalyticsSummaryDto })
  async getAnalyticsSummary(): Promise<AnalyticsSummaryDto> {
    return this.analyticsService.getSummary()
  }

  @Get('monthly-overview')
  @ApiOperation({ summary: 'Get monthly overview for last 12 months' })
  @ApiResponse({ status: 200, type: MonthlyOverviewDto })
  async getMonthlyOverview(): Promise<MonthlyOverviewDto> {
    return this.analyticsService.getMonthlyOverview()
  }

  @Get('article-category-stats')
  @ApiOperation({ summary: 'Get article category distribution and view counts' })
  @ApiResponse({ status: 200, type: ArticleCategoryStatsDto })
  async getArticleCategoryStats(): Promise<ArticleCategoryStatsDto> {
    return this.analyticsService.getArticleCategoryStats()
  }
}
