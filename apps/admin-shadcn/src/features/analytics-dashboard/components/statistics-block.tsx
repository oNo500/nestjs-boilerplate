'use client'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { ArrowRight, BookOpen, ShoppingBag } from 'lucide-react'

import { $api } from '@/lib/api'

const StatisticsBlock = () => {
  const { data: userSummary } = $api.useQuery('get', '/api/users/summary')
  const { data: analyticsSummary } = $api.useQuery('get', '/api/dashboard/analytics-summary')

  const mainMetrics = [
    {
      label: 'Total Users',
      value: userSummary?.total?.toLocaleString() ?? '—',
    },
    {
      label: 'Active Users',
      value: userSummary?.active?.toLocaleString() ?? '—',
    },
  ]

  const secondaryStats = [
    {
      title: 'Published Today',
      value: analyticsSummary?.publishedToday?.toLocaleString() ?? '—',
      icon: BookOpen,
    },
    {
      title: 'Completed Orders',
      value: analyticsSummary?.completedOrders?.toLocaleString() ?? '—',
      icon: ShoppingBag,
    },
  ]

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-12 xl:col-span-6 h-full">
        <Card className="p-0 ring-0 border rounded-2xl relative h-full">
          <CardContent className="p-0">
            <div className="ps-6 py-4 flex flex-col gap-9 justify-between">
              <div>
                <p className="text-lg font-medium text-card-foreground">
                  Analytics Dashboard
                </p>
                <p className="text-xs font-normal text-muted-foreground">
                  Check all the statistics
                </p>
              </div>
              <div className="flex items-center gap-6">
                {mainMetrics.map((metric, index) => (
                  <div key={metric.label} className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-normal text-muted-foreground">
                        {metric.label}
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-medium text-card-foreground">
                          {metric.value}
                        </p>
                      </div>
                    </div>
                    {index < mainMetrics.length - 1 && (
                      <Separator orientation="vertical" className="h-12" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {secondaryStats.map((stat) => (
        <div key={stat.title} className="col-span-12 sm:col-span-6 xl:col-span-3">
          <Card className="py-6 ring-0 border rounded-2xl">
            <CardContent className="px-6 flex items-start justify-between">
              <div className="flex flex-col gap-5 justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-medium text-card-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-medium text-card-foreground">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 w-fit rounded-xl cursor-pointer shadow-xs h-9"
                >
                  <span>See Report</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
              <div className="p-3 rounded-full outline">
                <stat.icon size={16} />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default StatisticsBlock
