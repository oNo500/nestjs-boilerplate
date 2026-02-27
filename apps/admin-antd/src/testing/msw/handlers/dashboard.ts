import { faker } from '@faker-js/faker/locale/en'
import { format, subDays } from 'date-fns'
import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'

const BASE = env.API_URL

const today = new Date()

function buildDayTrend(n: number, baseValue: number, variance: number) {
  return Array.from({ length: n }, (_, i) => ({
    day: format(subDays(today, n - 1 - i), 'MM-dd'),
    sales: faker.number.int({ min: baseValue - variance, max: baseValue + variance }),
    visits: faker.number.int({ min: Math.round(baseValue * 0.5), max: Math.round(baseValue * 0.8) }),
  }))
}

const CATEGORY_FILLS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
const CATEGORIES = ['Home Appliances', 'Food & Beverage', 'Personal Care', 'Clothing & Bags', 'Baby Products', 'Other']

export const dashboardHandlers = [
  http.get(`${BASE}/api/dashboard/statistics`, () => {
    return HttpResponse.json({
      totalUsers: faker.number.int({ min: 15, max: 30 }),
      activeUsers: faker.number.int({ min: 10, max: 20 }),
      adminUsers: faker.number.int({ min: 1, max: 5 }),
      newUsersToday: faker.number.int({ min: 0, max: 8 }),
    })
  }),

  http.get(`${BASE}/api/dashboard/workplace`, () => {
    return HttpResponse.json({
      projects: Array.from({ length: 6 }, () => ({
        name: faker.company.name(),
        desc: faker.lorem.sentence(),
        team: faker.helpers.arrayElement(['Science Crew', 'All Stars Team', 'Design Rebels', 'Daily Dev', 'Elite Design Guild', 'CS Recruits']),
        updatedAt: faker.helpers.arrayElement(['Just now', '1 hour ago', 'Yesterday', '3 days ago', '9 years ago']),
      })),
      activities: Array.from({ length: 6 }, () => ({
        user: faker.person.fullName(),
        action: faker.helpers.arrayElement(['at', 'moved', 'completed']),
        project: faker.company.name(),
        item: faker.helpers.arrayElement(['June Iteration', 'Brand Iteration', 'Comment', '']),
        time: faker.helpers.arrayElement(['Just now', '1 hour ago', 'Yesterday']),
      })),
      teams: Array.from({ length: 6 }, () => {
        const name = faker.company.name()
        return { name, abbr: name[0] ?? 'T' }
      }),
      links: Array.from({ length: 6 }, (_, i) => ({ title: `Action ${i + 1}` })),
    })
  }),

  http.get(`${BASE}/api/dashboard/monitor`, () => {
    return HttpResponse.json({
      txTrend: Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        value: faker.number.int({ min: 20, max: 450 }),
      })),
      categoryRatio: CATEGORIES.map((name, i) => ({
        name,
        value: faker.number.int({ min: 1000, max: 5000 }),
        fill: CATEGORY_FILLS[i],
      })),
      hotSearch: Array.from({ length: 7 }, (_, i) => ({
        index: i + 1,
        keyword: `keyword-${i}`,
        count: faker.number.int({ min: 3000, max: 15_000 }),
        range: faker.number.int({ min: 1, max: 99 }),
        trend: faker.helpers.arrayElement(['up', 'down'] as const),
      })),
    })
  }),

  http.get(`${BASE}/api/dashboard/analysis`, () => {
    return HttpResponse.json({
      salesTrend: buildDayTrend(7, 14_000, 2000),
      salesTrendWeek: buildDayTrend(7, 110_000, 15_000),
      salesTrendMonth: buildDayTrend(30, 6000, 2000),
      storeRank: Array.from({ length: 7 }, (_, i) => ({
        rank: i + 1,
        name: `Store No.${i} on Gongzhuan Rd`,
        amount: faker.number.int({ min: 100_000, max: 500_000 }),
      })),
      hotSearch: Array.from({ length: 7 }, (_, i) => ({
        rank: i + 1,
        keyword: `keyword-${i}`,
        count: faker.number.int({ min: 50, max: 800 }),
        range: faker.number.int({ min: 1, max: 99 }),
        trend: faker.helpers.arrayElement(['up', 'down'] as const),
      })),
      categoryRatio: CATEGORIES.map((name, i) => ({
        name,
        value: faker.number.int({ min: 1000, max: 5000 }),
        fill: CATEGORY_FILLS[i],
      })),
      stores: Array.from({ length: 10 }, (_, i) => ({
        name: `Stores ${i}`,
        conversionRate: faker.number.int({ min: 10, max: 95 }),
      })),
    })
  }),
]
