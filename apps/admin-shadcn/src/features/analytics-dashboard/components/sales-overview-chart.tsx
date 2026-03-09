'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart'
import { cn } from '@workspace/ui/lib/utils'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { $api } from '@/lib/api'

import type { ChartConfig } from '@workspace/ui/components/chart'

const chartConfig = {
  expense: {
    label: 'Login Attempts',
    color: 'var(--color-blue-500)',
  },
  profit: {
    label: 'Published Articles',
    color: 'var(--color-sky-400)',
  },
  earning: {
    label: 'New Users',
    color: 'rgba(56, 189, 248, 0.5)',
  },
} satisfies ChartConfig

const LEGEND_ITEMS = [
  { title: 'New Users', color: 'bg-sky-400/50' },
  { title: 'Published Articles', color: 'bg-sky-400' },
  { title: 'Login Attempts', color: 'bg-blue-500' },
]

export default function SalesOverviewChart() {
  const { data } = $api.useQuery('get', '/api/dashboard/monthly-overview')

  const chartData = useMemo(() => {
    if (!data?.months) return []
    return data.months.map((m) => ({
      month: m.month,
      expense: m.loginAttempts,
      profit: m.publishedArticles,
      earning: m.newUsers,
    }))
  }, [data])

  const totalNewUsers = useMemo(
    () => data?.months.reduce((sum, m) => sum + m.newUsers, 0) ?? 0,
    [data],
  )

  return (
    <Card className="w-full py-6 gap-6">
      <CardHeader className="flex sm:flex-row flex-col justify-between sm:items-center items-start gap-3 px-6">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium">Monthly Overview</CardTitle>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-medium text-card-foreground">
              {totalNewUsers.toLocaleString()}
              {' '}
              new users
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-2">
              <span className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
              <p className="text-sm text-muted-foreground">{item.title}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(144, 164, 174, 0.3)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(5)}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="expense"
              stackId="a"
              fill="var(--color-expense)"
              radius={[0, 0, 4, 4]}
              barSize={20}
            />
            <Bar
              dataKey="profit"
              stackId="a"
              fill="var(--color-profit)"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="earning"
              stackId="a"
              fill="var(--color-earning)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
