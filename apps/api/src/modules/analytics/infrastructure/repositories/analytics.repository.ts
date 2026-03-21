import { Inject, Injectable } from '@nestjs/common'
import { articlesTable, loginLogsTable, ordersTable, usersTable } from '@workspace/database'
import { and, count, eq, gte, lt, sql, sum } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'

import type { DrizzleDb } from '@/app/database/db.port'
import type {
  AnalyticsSummary,
  ArticleCategoryStatItem,
  ArticleCategoryStats,
  IAnalyticsQuery,
  MonthlyOverview,
  MonthlyOverviewItem,
} from '@/modules/analytics/application/ports/analytics.query.port'

const ARTICLE_CATEGORIES = ['tech', 'design', 'product', 'other'] as const

@Injectable()
export class AnalyticsRepositoryImpl implements IAnalyticsQuery {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async getSummary(): Promise<AnalyticsSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [publishedTodayResult, completedOrdersResult] = await Promise.all([
      this.db
        .select({ count: count() })
        .from(articlesTable)
        .where(
          and(
            eq(articlesTable.status, 'published'),
            gte(articlesTable.publishedAt, today),
            lt(articlesTable.publishedAt, tomorrow),
          ),
        ),
      this.db
        .select({ count: count() })
        .from(ordersTable)
        .where(eq(ordersTable.status, 'completed')),
    ])

    return {
      publishedToday: publishedTodayResult[0]?.count ?? 0,
      completedOrders: completedOrdersResult[0]?.count ?? 0,
    }
  }

  async getMonthlyOverview(): Promise<MonthlyOverview> {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    const [newUsersRows, publishedArticlesRows, loginAttemptsRows] = await Promise.all([
      this.db
        .select({
          month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${usersTable.createdAt}), 'YYYY-MM')`,
          count: count(),
        })
        .from(usersTable)
        .where(gte(usersTable.createdAt, twelveMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', ${usersTable.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${usersTable.createdAt})`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${articlesTable.publishedAt}), 'YYYY-MM')`,
          count: count(),
        })
        .from(articlesTable)
        .where(
          and(
            eq(articlesTable.status, 'published'),
            gte(articlesTable.publishedAt, twelveMonthsAgo),
          ),
        )
        .groupBy(sql`DATE_TRUNC('month', ${articlesTable.publishedAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${articlesTable.publishedAt})`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${loginLogsTable.createdAt}), 'YYYY-MM')`,
          count: count(),
        })
        .from(loginLogsTable)
        .where(gte(loginLogsTable.createdAt, twelveMonthsAgo))
        .groupBy(sql`DATE_TRUNC('month', ${loginLogsTable.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${loginLogsTable.createdAt})`),
    ])

    // Build month list for last 12 months
    const months: MonthlyOverviewItem[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({
        month: monthKey,
        newUsers: 0,
        publishedArticles: 0,
        loginAttempts: 0,
      })
    }

    const monthMap = new Map(months.map((m) => [m.month, m]))

    for (const row of newUsersRows) {
      const item = monthMap.get(row.month)
      if (item) item.newUsers = row.count
    }
    for (const row of publishedArticlesRows) {
      const item = monthMap.get(row.month)
      if (item) item.publishedArticles = row.count
    }
    for (const row of loginAttemptsRows) {
      const item = monthMap.get(row.month)
      if (item) item.loginAttempts = row.count
    }

    return { months }
  }

  async getArticleCategoryStats(): Promise<ArticleCategoryStats> {
    const rows = await this.db
      .select({
        category: articlesTable.category,
        count: count(),
        viewCount: sum(articlesTable.viewCount),
      })
      .from(articlesTable)
      .groupBy(articlesTable.category)

    const rowMap = new Map(rows.map((r) => [r.category, r]))

    const categories: ArticleCategoryStatItem[] = ARTICLE_CATEGORIES.map((cat) => {
      const row = rowMap.get(cat)
      return {
        category: cat,
        count: row?.count ?? 0,
        viewCount: Number(row?.viewCount ?? 0),
      }
    })

    return { categories }
  }
}
