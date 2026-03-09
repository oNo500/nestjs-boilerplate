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

export interface IAnalyticsRepository {
  getSummary(): Promise<AnalyticsSummary>
  getMonthlyOverview(): Promise<MonthlyOverview>
  getArticleCategoryStats(): Promise<ArticleCategoryStats>
}

export const ANALYTICS_REPOSITORY = Symbol('ANALYTICS_REPOSITORY')
