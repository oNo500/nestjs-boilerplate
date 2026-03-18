export interface AnalyticsSummary {
  publishedToday: number
  completedOrders: number
}

export interface MonthlyOverviewItem {
  month: string
  newUsers: number
  publishedArticles: number
  loginAttempts: number
}

export interface MonthlyOverview {
  months: MonthlyOverviewItem[]
}

export interface ArticleCategoryStatItem {
  category: 'tech' | 'design' | 'product' | 'other'
  count: number
  viewCount: number
}

export interface ArticleCategoryStats {
  categories: ArticleCategoryStatItem[]
}

// Read-only query interface (no write operations — use IAnalyticsQuery, not IAnalyticsRepository)
export interface IAnalyticsQuery {
  getSummary(): Promise<AnalyticsSummary>
  getMonthlyOverview(): Promise<MonthlyOverview>
  getArticleCategoryStats(): Promise<ArticleCategoryStats>
}

export const ANALYTICS_QUERY = Symbol('ANALYTICS_QUERY')
