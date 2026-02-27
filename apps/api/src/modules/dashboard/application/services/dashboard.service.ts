import { Inject, Injectable } from '@nestjs/common'
import { usersTable } from '@workspace/database'
import dayjs from 'dayjs'
import { count, eq, gte } from 'drizzle-orm'

import { StatisticsDto } from '@/modules/dashboard/presentation/dtos/statistics.dto'
import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async getStatistics(): Promise<StatisticsDto> {
    const today = dayjs().startOf('day').toDate()

    const [totalUsers, activeUsers, adminUsers, newUsersToday]
      = await Promise.all([
        this.db.select({ count: count() }).from(usersTable),
        this.db.select({ count: count() }).from(usersTable).where(eq(usersTable.banned, false)),
        this.db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, 'ADMIN')),
        this.db.select({ count: count() }).from(usersTable).where(gte(usersTable.createdAt, today)),
      ])

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      activeUsers: activeUsers[0]?.count ?? 0,
      adminUsers: adminUsers[0]?.count ?? 0,
      newUsersToday: newUsersToday[0]?.count ?? 0,
    }
  }
}
