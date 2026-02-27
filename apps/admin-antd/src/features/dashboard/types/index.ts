export interface StatisticsDto {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  newUsersToday: number
}

export interface TrendPoint {
  day: string
  value: number
}

export interface HourPoint {
  hour: string
  value: number
}

export interface WorkplaceDto {
  projects: { name: string, desc: string, team: string, updatedAt: string }[]
  activities: { user: string, action: string, project: string, item: string, time: string }[]
  teams: { name: string, abbr: string }[]
  links: { title: string }[]
}

export interface MonitorDto {
  txTrend: { time: string, value: number }[]
  categoryRatio: { name: string, value: number, fill: string }[]
  hotSearch: { index: number, keyword: string, count: number, range: number, trend: 'up' | 'down' }[]
}

export interface AnalysisDto {
  salesTrend: { day: string, sales: number, visits: number }[]
  salesTrendWeek: { day: string, sales: number, visits: number }[]
  salesTrendMonth: { day: string, sales: number, visits: number }[]
  storeRank: { rank: number, name: string, amount: number }[]
  hotSearch: { rank: number, keyword: string, count: number, range: number, trend: 'up' | 'down' }[]
  categoryRatio: { name: string, value: number, fill: string }[]
  stores: { name: string, conversionRate: number }[]
}
