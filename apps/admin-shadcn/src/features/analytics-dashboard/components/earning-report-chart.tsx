'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart'
import { cn } from '@workspace/ui/lib/utils'
import { useMemo } from 'react'
import { Label, Pie, PieChart } from 'recharts'

import { $api } from '@/lib/api'

import type { ChartConfig } from '@workspace/ui/components/chart'

const CATEGORY_COLORS: Record<string, string> = {
  tech: 'var(--color-blue-500)',
  design: 'var(--color-sky-400)',
  product: 'rgba(56, 189, 248, 0.5)',
  other: 'rgba(56, 189, 248, 0.2)',
}

const CATEGORY_BAR_COLORS: Record<string, string> = {
  tech: 'bg-blue-500',
  design: 'bg-sky-400',
  product: 'bg-sky-400/50',
  other: 'bg-sky-400/20',
}

const chartConfig = {
  count: {
    label: 'Articles',
  },
} satisfies ChartConfig

export default function EarningReportChart() {
  const { data } = $api.useQuery('get', '/api/dashboard/article-category-stats')

  const chartData = useMemo(() => {
    if (!data?.categories) return []
    return data.categories.map((cat) => ({
      browser: cat.category,
      visitors: cat.count,
      fill: CATEGORY_COLORS[cat.category] ?? 'rgba(56, 189, 248, 0.2)',
    }))
  }, [data])

  const totalCount = useMemo(
    () => data?.categories.reduce((sum, c) => sum + c.count, 0) ?? 0,
    [data],
  )

  return (
    <Card className="h-full w-full py-6 gap-6">
      <CardHeader className="px-6">
        <CardTitle>
          <h4 className="text-lg font-semibold">Article Categories</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-2 flex-1 px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={65}
              strokeWidth={50}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-muted-foreground text-sm"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 15}
                          className="fill-foreground text-xl font-medium"
                        >
                          {totalCount}
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col gap-3">
          {(data?.categories ?? []).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(CATEGORY_BAR_COLORS[item.category], 'w-1 h-4 rounded-full')} />
                <h6 className="text-sm font-medium capitalize">{item.category}</h6>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {item.count}
                  {' '}
                  articles
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.viewCount.toLocaleString()}
                  {' '}
                  views
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
